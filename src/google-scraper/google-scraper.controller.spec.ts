import { Test, TestingModule } from '@nestjs/testing';
import { GoogleScraperController } from './google-scraper.controller';

describe('GoogleScraperController', () => {
  let controller: GoogleScraperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleScraperController],
    }).compile();

    controller = module.get<GoogleScraperController>(GoogleScraperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
