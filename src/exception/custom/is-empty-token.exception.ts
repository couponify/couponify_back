import { CustomException } from '../custom.exception';

export class IsEmptyTokenExceotion extends CustomException {
  constructor() {
    super('Token이 필요하지만 존재하지 않습니다.', 400);
  }
}
