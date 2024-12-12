import { CustomException } from '../custom.exception';

export class UserPasswordNotMatchedException extends CustomException {
  constructor() {
    super('비밀번호가 일치하지 않습니다.', 400);
  }
}
