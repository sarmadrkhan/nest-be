import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsStrongPassword } from '../decorator';

export class AuthDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Str0ng@Pass1' })
  @IsNotEmpty()
  @IsStrongPassword(8)
  password: string;
}
