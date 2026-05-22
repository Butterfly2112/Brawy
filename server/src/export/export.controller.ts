import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { type Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { ExportService } from './export.service';
import { ExportSvgDto } from './dto/export-svg.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post('svg')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  @ApiOperation({
    summary: 'Export project canvas as self-contained SVG',
    description:
      'Converts canvasData JSON (Konva stage format) to an SVG file. ' +
      'Remote images and custom fonts from Cloudinary are fetched and embedded as base64, ' +
      'making the output fully self-contained.',
  })
  @ApiBody({ type: ExportSvgDto })
  @ApiOkResponse({
    description: 'SVG file stream',
    content: { 'image/svg+xml': {} },
  })
  async exportSvg(
    @Body() dto: ExportSvgDto,
    @Res() res: Response,
  ): Promise<void> {
    const svg = await this.exportService.canvasDataToSvg(dto.canvasData);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="export.svg"');
    res.send(svg);
  }
}
