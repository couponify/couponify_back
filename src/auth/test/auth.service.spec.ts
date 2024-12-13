import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserAlreadyExistsException } from 'src/exception/custom/user-already-exists.exception';
import { JwtService } from '@nestjs/jwt';
import { UserNotFoundException } from 'src/exception/custom/user-not-found.exception';
import { UserPasswordNotMatchedException } from 'src/exception/custom/user-password-not-matched.exception';

describe('AuthService', () => {
  let authService: AuthService;
  let configService: ConfigService;
  let userRepository: Repository<User>;
  let jestService: JwtService;

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
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
    jestService = module.get<JwtService>(JwtService);
  });

  it('should Defined', () => {
    expect(AuthService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('tokenGenerate', () => {
    it('should return a token', async () => {
      const user = {
        email: 'test@gmail.com',
      } as User;

      jest.spyOn(jestService, 'signAsync').mockResolvedValue('token');

      const result = await authService.tokenGenerate(user, false);
      const result2 = await authService.tokenGenerate(user, true);

      expect(result).toEqual('token');
      expect(result2).toEqual('token');
      expect(jestService.signAsync).toHaveBeenNthCalledWith(
        1,
        { email: user.email, isRefreshToken: false },
        {
          secret: configService.get('JWT_SECRET'),
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      );
      expect(jestService.signAsync).toHaveBeenNthCalledWith(
        2,
        { email: user.email, isRefreshToken: true },
        {
          secret: configService.get('JWT_RE_SECRET'),
          expiresIn: configService.get('JWT_RE_EXPIRATION'),
        },
      );
    });
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

  describe('login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    it('should return a token', async () => {
      const loginRequest = {
        email: 'test@gmail.com',
        password: 'test',
      };

      const user = {
        email: 'test@gmail.com',
        password: 'hashedPassword',
      } as User;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation((a, b) => true);
      jest.spyOn(authService, 'tokenGenerate').mockResolvedValue('token');

      const result = await authService.login(loginRequest);
      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
      });

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: loginRequest.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginRequest.password,
        user.password,
      );
      expect(authService.tokenGenerate).toHaveBeenCalledWith(user, false);
      expect(authService.tokenGenerate).toHaveBeenCalledWith(user, true);
    });

    it('should throw an error if user not found', async () => {
      const loginRequest = {
        email: 'test@gmail.com',
        password: 'test',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      const result = authService.login(loginRequest);

      await expect(result).rejects.toThrow(UserNotFoundException);
    });

    it('should throw an error if password not match', async () => {
      const loginRequest = {
        email: 'test@gmail.com',
        password: 'test',
      };

      const user = {
        email: 'test@gmail.com',
        password: 'hashedPassword',
      } as User;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation((a, b) => false);

      const result = authService.login(loginRequest);

      await expect(result).rejects.toThrow(UserPasswordNotMatchedException);
    });
  });
});
