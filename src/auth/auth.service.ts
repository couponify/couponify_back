import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { SignUpRequestDto } from './dto/request/signup-request.dto';
import { SignUpResponseDto } from './dto/response/signup-response.dto';
import { UserAlreadyExistsException } from 'src/exception/custom/user-already-exists.exception';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { UserNotFoundException } from 'src/exception/custom/user-not-found.exception';
import { UserPasswordNotMatchedException } from 'src/exception/custom/user-password-not-matched.exception';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/response/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async tokenGenerate(user: User, isRefreshToken: boolean) {
    return await this.jwtService.signAsync(
      { email: user.email, isRefreshToken },
      {
        secret: isRefreshToken
          ? this.configService.get('JWT_RE_SECRET')
          : this.configService.get('JWT_SECRET'),
        expiresIn: isRefreshToken
          ? this.configService.get('JWT_RE_EXPIRATION')
          : this.configService.get('JWT_EXPIRATION'),
      },
    );
  }

  async signup(
    signupRequest: SignUpRequestDto,
    image: Express.Multer.File,
  ): Promise<SignUpResponseDto> {
    const { email, password, nickname } = signupRequest;

    const userExists = await this.userRepository.findOneBy({ email });
    if (userExists) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.get('HASH_ROUND'),
    );

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nickname,
      profileImage: image.originalname,
    });

    return new SignUpResponseDto(await this.userRepository.save(user));
  }

  async login(loginRequest: LoginRequestDto) {
    const { email, password } = loginRequest;

    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UserNotFoundException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UserPasswordNotMatchedException();
    }

    return new LoginResponseDto(
      await this.tokenGenerate(user, false),
      await this.tokenGenerate(user, true),
    );
  }

  async withdraw(user: User) {
    await this.userRepository.delete({ email: user.email });
  }
}
