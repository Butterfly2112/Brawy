import { ApiProperty } from '@nestjs/swagger';

export class SafeUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'mosquito_edward' })
  login: string;

  @ApiProperty({ example: 'Edward' })
  username: string;

  @ApiProperty({ example: 'mosquito@example.com' })
  email: string;

  @ApiProperty({ example: 'default' })
  avatar_url: string;

  @ApiProperty()
  created_at: Date;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGci...' })
  access_token: string;

  @ApiProperty({ type: SafeUserDto })
  user: SafeUserDto;
}
