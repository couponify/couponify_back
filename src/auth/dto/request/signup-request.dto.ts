import { IsEmail, IsString } from 'class-validator';

export class SignUpRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  nickname: string;
}
