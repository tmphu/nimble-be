import { Module } from '@nestjs/common';
import { GoogleScraperModule } from './google-scraper/google-scraper.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GoogleScraperModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
