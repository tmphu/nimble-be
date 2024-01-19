import { Module } from '@nestjs/common';
import { GoogleScraperController } from './google-scraper.controller';
import { GoogleScraperService } from './google-scraper.service';
import { PrismaService } from 'src/prisma-client/prisma.service';
import { PrismaModule } from 'src/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoogleScraperController],
  providers: [GoogleScraperService, PrismaService],
})
export class GoogleScraperModule {}
