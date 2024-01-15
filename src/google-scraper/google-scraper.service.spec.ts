import { Test, TestingModule } from '@nestjs/testing';
import { GoogleScraperService } from './google-scraper.service';

describe('GoogleScraperService', () => {
  let service: GoogleScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleScraperService],
    }).compile();

    service = module.get<GoogleScraperService>(GoogleScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
