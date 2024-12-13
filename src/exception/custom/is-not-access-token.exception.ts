import { CustomException } from '../custom.exception';

export class IsNotAccessTokenException extends CustomException {
  constructor() {
    super('Token의 유형이 적절하지 않습니다. Access 토큰을 사용해주세요', 401);
  }
}
