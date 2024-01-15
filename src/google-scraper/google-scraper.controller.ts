import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  csvFileFilter,
  csvFileName,
  getFilePath,
} from 'src/shared/helper/file.helper';
import { GoogleScraperService } from './google-scraper.service';

@Controller({ path: 'api/v1/scraper/google' })
export class GoogleScraperController {
  constructor(private service: GoogleScraperService) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    return this.service.uploadFile({
      fileName: file.originalname,
      filePath: getFilePath(file.filename),
    });
  }
}
