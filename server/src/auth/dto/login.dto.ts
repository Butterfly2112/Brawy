import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ examples: ['edward', 'edward@example.com'] })
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @ApiProperty({ example: 'StrongPass1' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
