import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { SignUpRequestDto } from './dto/request/signup-request.dto';
import { SignUpResponseDto } from './dto/response/signup-response.dto';
import { CustomException } from 'src/exception/custom.exception';
import { UserAlreadyExistsException } from 'src/exception/custom/user-already-exists.exception';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

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
}
