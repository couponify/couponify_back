import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserAlreadyExistsException } from 'src/exception/custom/user-already-exists.exception';

describe('AuthService', () => {
  let authService: AuthService;
  let configService: ConfigService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should Defined', () => {
    expect(AuthService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('signup', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    it('should create a new user', async () => {
      const image = {
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const signUpRequest = {
        email: 'test@gmail.com',
        password: 'test',
        nickname: 'test',
      };

      const hashedPassword = 'hashedPassword';
      const configHashRound = 1;

      jest.spyOn(bcrypt, 'hash').mockImplementation((a, b) => hashedPassword);
      jest.spyOn(configService, 'get').mockReturnValue(configHashRound);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...signUpRequest,
        password: hashedPassword,
        profileImage: image.originalname,
      });
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...signUpRequest,
        password: hashedPassword,
        profileImage: image.originalname,
      });

      const result = await authService.signup(signUpRequest, image);
      expect(result).toEqual({
        email: signUpRequest.email,
        nickname: signUpRequest.nickname,
        profileImage: image.originalname,
      });

      expect(configService.get).toHaveBeenCalledWith('HASH_ROUND');
      expect(bcrypt.hash).toHaveBeenCalledWith(
        signUpRequest.password,
        configHashRound,
      );

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: signUpRequest.email,
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        ...signUpRequest,
        password: hashedPassword,
        profileImage: image.originalname,
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...signUpRequest,
        password: hashedPassword,
        profileImage: image.originalname,
      });
    });

    it('should throw an error if user already exists', async () => {
      const image = {
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const signUpRequest = {
        email: 'test@gmail.com',
        password: 'test',
        nickname: 'test',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({
        email: 'test@gmail.com',
      } as User);

      const result = authService.signup(signUpRequest, image);

      await expect(result).rejects.toThrow(UserAlreadyExistsException);
    });
  });
});
