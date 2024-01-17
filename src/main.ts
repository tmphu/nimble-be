import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FileHelper } from './shared/helper/file.helper';
import { CACHE_DIR_NAME, UPLOADS_DIR_NAME } from './shared/helper/constants';

async function bootstrap() {
  await FileHelper.createDirIfNotExist(
    FileHelper.getAbsolutePath(UPLOADS_DIR_NAME),
  );
  await FileHelper.createDirIfNotExist(
    FileHelper.getAbsolutePath(CACHE_DIR_NAME),
  );

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
