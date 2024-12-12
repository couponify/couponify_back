import { CustomException } from '../custom.exception';

export class UserNotFoundException extends CustomException {
  constructor() {
    super('해당 회원을 찾을 수 없습니다.', 404);
  }
}
