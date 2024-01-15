import { Module } from '@nestjs/common';
import { GoogleScraperController } from './google-scraper.controller';
import { GoogleScraperService } from './google-scraper.service';

@Module({
  controllers: [GoogleScraperController],
  providers: [GoogleScraperService],
})
export class GoogleScraperModule {}
