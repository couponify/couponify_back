import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/request/signup-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async signup(
    @Body() signupRequest: SignUpRequestDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.authService.signup(signupRequest, image);
  }
}
