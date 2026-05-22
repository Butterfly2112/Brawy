import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class ExportSvgDto {
  @ApiProperty({
    description: 'The canvasData JSON object from a project',
  })
  @IsObject()
  canvasData: Record<string, any>;
}
