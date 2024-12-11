import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.HTTP_PORT;
  await app.listen(port, () => {
    Logger.log(`Server Started at ${port}port`);
  });
}
bootstrap();
