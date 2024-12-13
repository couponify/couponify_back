import { CustomException } from "../custom.exception";

export class TokenExpiredException extends CustomException {
  constructor() {
    super('만료된 토큰을 사용하였습니다.', 401);
  }
}