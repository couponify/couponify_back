import { CustomException } from '../custom.exception';

export class UserAlreadyExistsException extends CustomException {
  constructor() {
    super('이미 해당 이메일을 사용중인 회원이 있습니다.', 409);
  }
}
