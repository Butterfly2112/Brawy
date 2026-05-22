import { Injectable, BadRequestException } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';
import { PrismaService } from 'src/prisma/prisma.service';

function esc(v: string): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return fetchBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

function guessMimeFromUrl(url: string): string {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.woff2')) return 'font/woff2';
  if (clean.endsWith('.woff')) return 'font/woff';
  if (clean.endsWith('.ttf')) return 'font/ttf';
  if (clean.endsWith('.otf')) return 'font/otf';
  return 'image/jpeg';
}

function starPoints(outerR: number, innerR: number, numPoints: number): string {
  const pts: string[] = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (Math.PI / numPoints) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function polygonPoints(sides: number, radius: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((Math.PI * 2) / sides) * i - Math.PI / 2;
    pts.push(`${radius * Math.cos(angle)},${radius * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function buildTransform(
  el: Record<string, any>,
  isCenterOrigin = false,
): string {
  const parts: string[] = [];
  const x = el.x ?? 0;
  const y = el.y ?? 0;
  const sx = el.scaleX ?? 1;
  const sy = el.scaleY ?? 1;
  const rot = el.rotation ?? 0;

  if (x !== 0 || y !== 0) parts.push(`translate(${x},${y})`);

  if (rot !== 0) {
    if (isCenterOrigin) {
      parts.push(`rotate(${rot})`);
    } else {
      const w = (el.width ?? 0) * sx;
      const h = (el.height ?? 0) * sy;
      parts.push(`rotate(${rot},${w / 2},${h / 2})`);
    }
  }

  if (sx !== 1 || sy !== 1) parts.push(`scale(${sx},${sy})`);
  return parts.join(' ');
}

interface CanvasAttrs {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}
  private urlCache = new Map<string, string>();

  async canvasDataToSvg(canvasData: Record<string, any>): Promise<string> {
    if (!canvasData || canvasData.className !== 'Stage') {
      throw new BadRequestException(
        'canvasData must be a valid Konva Stage JSON',
      );
    }

    this.urlCache.clear();
    this.pendingFonts = [];

    const stageAttrs: CanvasAttrs = canvasData.attrs ?? {};
    const width = stageAttrs.width ?? 800;
    const height = stageAttrs.height ?? 600;
    const bg = stageAttrs.backgroundColor ?? '#ffffff';

    await this.prefetchResources(canvasData);

    const fontFaces = this.buildFontFaces();

    const styleBlock =
      fontFaces.length > 0 ? `<style>\n${fontFaces.join('\n')}\n</style>` : '';

    const filtersBlock = `
      <filter id="filter-Grayscale"><feColorMatrix type="saturate" values="0"/></filter>
      <filter id="filter-Sepia"><feColorMatrix type="matrix" values="0.393 0.769 0.189 0 0  0.349 0.686 0.168 0 0  0.272 0.534 0.131 0 0  0 0 0 1 0"/></filter>
      <filter id="filter-Invert"><feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/></filter>
      <filter id="filter-Blur"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="filter-Bright"><feComponentTransfer><feFuncR type="linear" slope="1.4"/><feFuncG type="linear" slope="1.4"/><feFuncB type="linear" slope="1.4"/></feComponentTransfer></filter>
    `;

    const defsBlock = `<defs>\n${styleBlock}\n${filtersBlock}\n</defs>`;

    const bgRect =
      bg === 'transparent'
        ? ''
        : `<rect width="${width}" height="${height}" fill="${esc(bg)}"/>`;

    const children: string[] = canvasData.children ?? [];
    const layerSvgs = await Promise.all(
      children
        .filter((c: any) => c.className === 'Layer' || c.type !== undefined)
        .map((child: any) => this.renderChild(child)),
    );

    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
      `     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      defsBlock,
      bgRect,
      `<svg x="0" y="0" width="${width}" height="${height}">`,
      ...layerSvgs,
      `</svg>`,
      `</svg>`,
    ].join('\n');
  }

  private async prefetchResources(node: any): Promise<void> {
    const urls = new Set<string>();
    const fontFamilies = new Set<string>();

    this.collectUrlsAndFonts(node, urls, fontFamilies);

    await Promise.all([
      Promise.allSettled([...urls].map((url) => this.fetchAsDataUri(url))),
      this.loadFontsFromDb(fontFamilies),
    ]);
  }

  private collectUrlsAndFonts(
    node: any,
    urls: Set<string>,
    fonts: Set<string>,
  ): void {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'image' && node.src) {
      urls.add(node.src);
    }

    if (node.type === 'text' && node.fontFamily) {
      fonts.add(node.fontFamily);
    }

    const children: any[] = node.children ?? [];
    children.forEach((c) => this.collectUrlsAndFonts(c, urls, fonts));
  }

  private async loadFontsFromDb(fontFamilies: Set<string>): Promise<void> {
    if (fontFamilies.size === 0) return;

    const fonts = await this.prisma.font.findMany({
      where: {
        name: { in: Array.from(fontFamilies) },
      },
      select: { url: true, format: true, name: true },
    });

    await Promise.allSettled(
      fonts.map(async (font) => {
        if (font.url) {
          const dataUri = await this.fetchAsDataUri(font.url);
          const format = font.format
            ? this.mapMimeToCssFormat(font.format)
            : 'truetype';

          this.pendingFonts.push({
            fontFamily: font.name,
            dataUri: dataUri,
            format: format,
          });
        }
      }),
    );
  }

  private mapMimeToCssFormat(formatOrUrl: string): string {
    const str = formatOrUrl.toLowerCase();
    if (str.includes('woff2')) return 'woff2';
    if (str.includes('woff')) return 'woff';
    if (str.includes('ttf') || str.includes('truetype')) return 'truetype';
    if (str.includes('otf') || str.includes('opentype')) return 'opentype';
    return 'truetype';
  }

  private collectUrls(node: any, out: Set<string>): void {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'image' && node.src) out.add(node.src);
    if (node.fontUrl) out.add(node.fontUrl);
    const children: any[] = node.children ?? [];
    children.forEach((c) => this.collectUrls(c, out));
  }

  private async fetchAsDataUri(url: string): Promise<string> {
    if (this.urlCache.has(url)) return this.urlCache.get(url)!;
    try {
      const buf = await fetchBuffer(url);
      const mime = guessMimeFromUrl(url);
      const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
      this.urlCache.set(url, dataUri);
      return dataUri;
    } catch (err) {
      console.warn(`[ExportService] Could not fetch ${url}:`, err);
      this.urlCache.set(url, url);
      return url;
    }
  }

  private pendingFonts: Array<{
    fontFamily: string;
    dataUri: string;
    format: string;
  }> = [];

  private buildFontFaces(): string[] {
    return this.pendingFonts.map(
      (f) =>
        `@font-face { font-family: "${f.fontFamily}"; src: url("${f.dataUri}") format("${f.format}"); }`,
    );
  }

  private async renderChild(node: any): Promise<string> {
    if (!node) return '';

    // Konva Layer
    if (node.className === 'Layer') {
      const kids = await Promise.all(
        (node.children ?? []).map((c: any) => this.renderElement(c)),
      );
      return `<g>${kids.join('')}</g>`;
    }

    return this.renderElement(node);
  }

  private async renderElement(el: any): Promise<string> {
    if (!el || !el.type) return '';

    switch (el.type) {
      case 'shape':
        return this.renderShape(el);
      case 'text':
        return this.renderText(el);
      case 'line':
        return this.renderLine(el);
      case 'image':
        return this.renderImage(el);
      default:
        return '';
    }
  }

  private renderShape(el: any): string {
    const fill = el.fill ?? 'transparent';
    const stroke = el.stroke ?? 'none';
    const strokeWidth = el.strokeWidth ?? 0;

    const w = el.width ?? 100;
    const h = el.height ?? 100;

    const isCenterOrigin =
      el.shapeType === 'star' || el.shapeType === 'triangle';
    const transform = buildTransform(el, isCenterOrigin);

    const commonAttrs = `fill="${esc(fill)}" stroke="${esc(stroke)}" stroke-width="${strokeWidth}"`;
    const tfAttr = transform ? ` transform="${esc(transform)}"` : '';

    switch (el.shapeType) {
      case 'rect': {
        const cr = el.cornerRadius ?? 0;
        return `<rect width="${w}" height="${h}" rx="${cr}" ry="${cr}" ${commonAttrs}${tfAttr}/>`;
      }
      case 'ellipse': {
        const rx = w / 2;
        const ry = h / 2;
        return `<ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" ${commonAttrs}${tfAttr}/>`;
      }
      case 'triangle': {
        const radius = w / 2;
        const pts = polygonPoints(el.sides ?? 3, radius);
        return `<polygon points="${pts}" ${commonAttrs}${tfAttr}/>`;
      }
      case 'star': {
        const numPoints = el.numPoints ?? 5;
        const outerR = Math.min(w, h) / 2;
        const innerR = el.innerRadius ?? outerR * 0.4;
        const pts = starPoints(outerR, innerR, numPoints);
        return `<polygon points="${pts}" ${commonAttrs}${tfAttr}/>`;
      }
      default:
        return `<rect width="${w}" height="${h}" ${commonAttrs}${tfAttr}/>`;
    }
  }

  private renderText(el: any): string {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const fontSize = el.fontSize ?? 16;
    const fill = el.fill ?? '#000000';
    const fontFamily = el.fontFamily ?? 'sans-serif';
    const align = el.align ?? 'left';
    const width = el.width ?? 300;
    const scaleX = el.scaleX ?? 1;
    const scaleY = el.scaleY ?? 1;
    const rotation = el.rotation ?? 0;
    const text = el.text ?? '';

    const fStyleStr = el.fontStyle ?? '';
    const isItalic = fStyleStr.includes('italic') ? 'italic' : 'normal';
    const isBold = fStyleStr.includes('bold') ? 'bold' : 'normal';
    const textDecoration =
      el.textDecoration === 'underline'
        ? 'underline'
        : el.textDecoration === 'line-through'
          ? 'line-through'
          : 'none';

    const anchorMap: Record<string, string> = {
      left: 'start',
      center: 'middle',
      right: 'end',
    };
    const textAnchor = anchorMap[align] ?? 'start';
    const textX =
      align === 'center' ? width / 2 : align === 'right' ? width : 0;
    const lines = String(text).split('\n');
    const parts: string[] = [];

    const transform = buildTransform({
      x,
      y,
      scaleX,
      scaleY,
      rotation,
      offsetX: el.offsetX,
      offsetY: el.offsetY,
    });
    const tfAttr = transform ? ` transform="${esc(transform)}"` : '';

    parts.push(
      `<text x="${textX}" y="0" font-size="${fontSize}" fill="${esc(fill)}"` +
        ` font-family="${esc(fontFamily)}" font-style="${isItalic}" font-weight="${isBold}" text-decoration="${textDecoration}"` +
        ` text-anchor="${textAnchor}" dominant-baseline="text-before-edge"${tfAttr}>`,
    );

    lines.forEach((line, i) => {
      const dy = i === 0 ? -(fontSize * 0.15) : fontSize * 1.2;
      parts.push(`  <tspan x="${textX}" dy="${dy}">${esc(line)}</tspan>`);
    });

    parts.push('</text>');
    return parts.join('\n');
  }

  private renderLine(el: any): string {
    const points: number[] = el.points ?? [];
    if (points.length < 4) return '';

    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const stroke = el.stroke ?? '#000000';
    const strokeWidth = el.strokeWidth ?? 2;
    const dash: number[] = el.dash ?? [];
    const dashAttr =
      dash.length > 0 ? ` stroke-dasharray="${dash.join(',')}"` : '';

    const pts: string[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      pts.push(`${points[i]},${points[i + 1]}`);
    }

    const transform =
      x !== 0 || y !== 0 ? ` transform="translate(${x},${y})"` : '';

    return (
      `<polyline points="${pts.join(' ')}" fill="none"` +
      ` stroke="${esc(stroke)}" stroke-width="${strokeWidth}"${dashAttr}${transform}/>`
    );
  }

  private async renderImage(el: any): Promise<string> {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const w = el.width ?? 100;
    const h = el.height ?? 100;
    const transform = buildTransform(el);
    const tfAttr = transform ? ` transform="${esc(transform)}"` : '';

    const src: string | undefined = el.src;
    if (!src) return '';

    const href = await this.fetchAsDataUri(src);

    const filterName = el.filter;
    const validFilters = ['Grayscale', 'Sepia', 'Invert', 'Blur', 'Bright'];

    const filterAttr = validFilters.includes(filterName)
      ? ` filter="url(#filter-${filterName})"`
      : '';

    return (
      `<image x="0" y="0" width="${w}" height="${h}"` +
      ` href="${esc(href)}"${tfAttr}${filterAttr} preserveAspectRatio="xMidYMid meet"/>`
    );
  }
}
