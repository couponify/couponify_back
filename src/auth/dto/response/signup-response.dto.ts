import { User } from 'src/user/entity/user.entity';

export class SignUpResponseDto {
  constructor(user: User) {
    this.email = user.email;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
  }

  email: string;
  nickname: string;
  profileImage: string;
}
