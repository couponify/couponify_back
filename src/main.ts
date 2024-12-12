import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { CustomExceptionFilter } from './exception/custom-exception.filter';
import { CustomValidationPipe } from './exception/custom-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalFilters(new CustomExceptionFilter());

  const port = process.env.HTTP_PORT;
  await app.listen(port, () => {
    Logger.log(`Server Started at ${port}port`);
  });
}
bootstrap();
