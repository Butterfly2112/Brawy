import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

//UNDER CONSTRUCTION
const SYSTEM_TEMPLATES = [
  {
    id: 101,
    title: 'Hero — Large Heading',
    description: 'Centered big title and subtitle',
    width: 1200,
    height: 800,
    thumbnailUrl: null,
    isTemplate: true,
    updatedAt: '2026-05-20T00:00:00.000Z',
    ownerId: null,
    canvasData: {
      className: 'Stage',
      attrs: {
        width: 1200,
        height: 800,
        backgroundColor: '#ffffff',
      },
      children: [
        {
          className: 'Layer',
          attrs: {},
          children: [],
        },
        {
          id: 't1',
          type: 'text',
          x: 600,
          y: 220,
          text: 'Your Big Title',
          fontSize: 64,
          fontFamily: 'Inter',
          fill: '#111827',
          align: 'center',
          width: 900,
        },
        {
          id: 't2',
          type: 'text',
          x: 600,
          y: 320,
          text: 'A short descriptive subtitle',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#6b7280',
          align: 'center',
          width: 700,
        },
      ],
    },
  },
  {
    id: 102,
    title: 'Two Columns — Text Left',
    description: 'Two-column layout with title and paragraph',
    width: 1200,
    height: 800,
    thumbnailUrl: null,
    isTemplate: true,
    updatedAt: '2026-05-20T00:00:00.000Z',
    ownerId: null,
    canvasData: {
      className: 'Stage',
      attrs: {
        width: 1200,
        height: 800,
        backgroundColor: '#ffffff',
      },
      children: [
        {
          className: 'Layer',
          attrs: {},
          children: [],
        },
        {
          id: 'leftTitle',
          type: 'text',
          x: 180,
          y: 140,
          text: 'Left Column Title',
          fontSize: 36,
          fontFamily: 'Inter',
          fill: '#111827',
          align: 'left',
          width: 360,
        },
        {
          id: 'leftBody',
          type: 'text',
          x: 180,
          y: 200,
          text: 'Left column paragraph — use this area for details.',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#374151',
          align: 'left',
          width: 360,
        },
        {
          id: 'rightTitle',
          type: 'text',
          x: 780,
          y: 140,
          text: 'Right Column Title',
          fontSize: 36,
          fontFamily: 'Inter',
          fill: '#111827',
          align: 'left',
          width: 360,
        },
        {
          id: 'rightBody',
          type: 'text',
          x: 780,
          y: 200,
          text: 'Right column paragraph — add images or lists here.',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#374151',
          align: 'left',
          width: 360,
        },
      ],
    },
  },
  {
    id: 103,
    title: 'Poster — Centered',
    description: 'Large centered title with accent bar',
    width: 800,
    height: 1200,
    thumbnailUrl: null,
    isTemplate: true,
    updatedAt: '2026-05-20T00:00:00.000Z',
    ownerId: null,
    canvasData: {
      className: 'Stage',
      attrs: {
        width: 800,
        height: 1200,
        backgroundColor: '#f9fafb',
      },
      children: [
        {
          className: 'Layer',
          attrs: {},
          children: [],
        },
        {
          id: 'accent',
          type: 'shape',
          shapeType: 'rect',
          x: 100,
          y: 520,
          width: 600,
          height: 6,
          fill: '#f97316',
        },
        {
          id: 'title',
          type: 'text',
          x: 400,
          y: 560,
          text: 'Event Title',
          fontSize: 56,
          fontFamily: 'Inter',
          fill: '#0f172a',
          align: 'center',
          width: 700,
        },
        {
          id: 'sub',
          type: 'text',
          x: 400,
          y: 640,
          text: 'Date · Location · Info',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#475569',
          align: 'center',
          width: 700,
        },
      ],
    },
  },
  {
    id: 104,
    title: 'Instagram Post (1080×1080)',
    description: 'Square Instagram post with large centered title and caption',
    width: 1080,
    height: 1080,
    thumbnailUrl: null,
    isTemplate: true,
    updatedAt: '2026-05-20T00:00:00.000Z',
    ownerId: null,
    canvasData: {
      className: 'Stage',
      attrs: {
        width: 1080,
        height: 1080,
        backgroundColor: '#ffffff',
      },
      children: [
        {
          className: 'Layer',
          attrs: {},
          children: [],
        },
        {
          id: 'igTitle',
          type: 'text',
          x: 540,
          y: 320,
          text: 'Main Message',
          fontSize: 64,
          fontFamily: 'Inter',
          fill: '#0f172a',
          align: 'center',
          width: 900,
        },
        {
          id: 'igSubtitle',
          type: 'text',
          x: 540,
          y: 420,
          text: 'Short supporting line',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#6b7280',
          align: 'center',
          width: 800,
        },
        {
          id: 'igFooter',
          type: 'text',
          x: 540,
          y: 980,
          text: '@yourhandle · #hashtag',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#475569',
          align: 'center',
          width: 1000,
        },
      ],
    },
  },
  {
    id: 105,
    title: 'Instagram Story (1080×1920)',
    description: 'Tall Instagram story layout with title and CTA',
    width: 1080,
    height: 1920,
    thumbnailUrl: null,
    isTemplate: true,
    updatedAt: '2026-05-20T00:00:00.000Z',
    ownerId: null,
    canvasData: {
      className: 'Stage',
      attrs: {
        width: 1080,
        height: 1920,
        backgroundColor: '#000000',
      },
      children: [
        {
          className: 'Layer',
          attrs: {},
          children: [],
        },
        {
          id: 'storyTitle',
          type: 'text',
          x: 540,
          y: 340,
          text: 'Swipe Up',
          fontSize: 56,
          fontFamily: 'Inter',
          fill: '#ffffff',
          align: 'center',
          width: 900,
        },
        {
          id: 'storyBody',
          type: 'text',
          x: 540,
          y: 520,
          text: 'Short vertical message or promo',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#e5e7eb',
          align: 'center',
          width: 900,
        },
        {
          id: 'storyCTA',
          type: 'shape',
          shapeType: 'rect',
          x: 340,
          y: 1600,
          width: 400,
          height: 80,
          fill: '#2563eb',
          cornerRadius: 10,
        },
        {
          id: 'storyCTAText',
          type: 'text',
          x: 540,
          y: 1640,
          text: 'Shop Now',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#ffffff',
          align: 'center',
          width: 360,
        },
      ],
    },
  },
  {
    id: 106,
    title: 'Invitation',
    description: 'Invitation card layout (portrait)',
    width: 1000,
    height: 1400,
    thumbnailUrl: null,
    isTemplate: true,
    updatedAt: '2026-05-20T00:00:00.000Z',
    ownerId: null,
    canvasData: {
      className: 'Stage',
      attrs: {
        width: 1000,
        height: 1400,
        backgroundColor: '#fffaf0',
      },
      children: [
        {
          className: 'Layer',
          attrs: {},
          children: [],
        },
        {
          id: 'invTitle',
          type: 'text',
          x: 500,
          y: 260,
          text: 'You are invited',
          fontSize: 48,
          fontFamily: 'Inter',
          fill: '#0f172a',
          align: 'center',
          width: 800,
        },
        {
          id: 'invName',
          type: 'text',
          x: 500,
          y: 380,
          text: 'Guest of Honor Name',
          fontSize: 32,
          fontFamily: 'Inter',
          fill: '#374151',
          align: 'center',
          width: 800,
        },
        {
          id: 'invDetails',
          type: 'text',
          x: 500,
          y: 520,
          text: 'Date · Time · Location',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#475569',
          align: 'center',
          width: 800,
        },
      ],
    },
  },
];

async function main() {
  console.log('Seeding system templates...');

  for (const template of SYSTEM_TEMPLATES) {
    const existing = await prisma.project.findFirst({
      where: {
        title: template.title,
        owner_id: null,
        is_template: true,
      },
    });

    if (existing) {
      console.log(`Skipping "${template.title}" — already exists`);
      continue;
    }

    await prisma.project.create({
      data: {
        title: template.title,
        description: template.description,
        width: template.width,
        height: template.height,
        is_template: template.isTemplate,
        owner_id: null,
        canvas_data: template.canvasData,
      },
    });

    console.log(`Created "${template.title}"`);
  }

  console.log('Done!');
  process.exit(0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
