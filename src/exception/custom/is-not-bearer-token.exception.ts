import { CustomException } from '../custom.exception';

export class IsNotBearerTokenException extends CustomException {
  constructor() {
    super('Bearer 토큰 유형을 사용해 주세요', 400);
  }
}
