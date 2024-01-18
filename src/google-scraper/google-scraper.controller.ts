import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileHelper } from 'src/shared/helper/file.helper';
import { GoogleScraperService } from './google-scraper.service';
import {
  CreateUploadResponseDto,
  Paginate,
  SearchResult,
  UploadDto,
} from './dtos/google-scraper.dto';
import { UPLOADS_DIR_NAME } from 'src/shared/helper/constants';

@Controller({ path: 'api/v1/scraper/google' })
export class GoogleScraperController {
  constructor(private service: GoogleScraperService) {}

  private uploadDir = UPLOADS_DIR_NAME;

  @Post('/uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR_NAME,
        filename: FileHelper.setUploadFileName,
      }),
      fileFilter: FileHelper.filterCsv,
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CreateUploadResponseDto> {
    return this.service.uploadFile({
      fileName: file.originalname,
      filePath: FileHelper.getAbsolutePath(
        `${this.uploadDir}/${file.filename}`,
      ),
    });
  }

  @Get('/uploads/search')
  async searchUploads(
    @Query('search') searchStr: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('status') status: string,
    @Query('orders') orders: string,
  ): Promise<Paginate<UploadDto>> {
    return this.service.searchUploads({
      searchStr,
      page,
      pageSize,
      status,
      orders,
    });
  }

  @Get('/results/search')
  async searchResults(
    @Query('search') searchStr: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('status') status: string,
    @Query('orders') orders: string,
  ): Promise<Paginate<SearchResult>> {
    return this.service.searchResults({
      searchStr,
      page,
      pageSize,
      status,
      orders,
    });
  }
}
