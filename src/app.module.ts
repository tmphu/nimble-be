import { Module } from '@nestjs/common';
import { GoogleScraperModule } from './google-scraper/google-scraper.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GoogleScraperModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
