import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';

export const GetUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): User => {
    const req = context.switchToHttp().getRequest();
    return req.user;
  },
);
