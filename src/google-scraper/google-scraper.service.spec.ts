import { Test, TestingModule } from '@nestjs/testing';
import { GoogleScraperService } from './google-scraper.service';
import { promises as fs } from 'fs';
import { PrismaService } from '../prisma-client/prisma.service';

const uploadRes = {
  id: 1,
  createdAt: new Date('2024-01-18 09:48:32.866'),
  updatedAt: new Date('2024-01-18 09:48:33.258'),
  fileName: 'upload123.csv',
  filePath: '/Users/john/documents/uploads/upload123.csv',
  status: 'UPLOADED',
};

const db = {
  upload: {
    create: jest.fn(),
  },
};

describe('GoogleScraperService', () => {
  let service: GoogleScraperService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleScraperService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<GoogleScraperService>(GoogleScraperService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should return as expected', async () => {
      const fileDto = {
        fileName: 'upload123.csv',
        filePath: '/Users/john/documents/uploads/upload123.csv',
      };

      const resData = {
        id: 1,
        createdAt: new Date('2024-01-18 09:48:32.866'),
        updatedAt: new Date('2024-01-18 09:48:33.258'),
        fileName: 'upload123.csv',
        status: 'UPLOADED',
      };

      const readFileSpy = jest.spyOn(fs, 'readFile');
      const uploadCreateSpy = jest.spyOn(prisma.upload, 'create');
      const searchAndSaveResultSpy = jest.spyOn(service, 'searchAndSaveResult');

      readFileSpy.mockResolvedValue('keyword1\nkeyword2');
      uploadCreateSpy.mockResolvedValueOnce(uploadRes);
      searchAndSaveResultSpy.mockResolvedValueOnce();

      // main function
      const uploadFn = service.uploadFile(fileDto);
      await expect(uploadFn).resolves.toEqual(resData);

      expect(readFileSpy).toHaveBeenCalled();
      expect(readFileSpy).toHaveBeenCalledWith(fileDto.filePath, 'utf8');

      expect(uploadCreateSpy).toHaveBeenCalled();
      expect(uploadCreateSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fileName: fileDto.fileName,
          filePath: fileDto.filePath,
          status: 'UPLOADED',
          searchResults: {
            createMany: {
              data: [
                {
                  keyword: 'keyword1',
                  status: 'WAITING',
                  searchEngine: 'https://google.com',
                },
                {
                  keyword: 'keyword2',
                  status: 'WAITING',
                  searchEngine: 'https://google.com',
                },
              ],
            },
          },
        }),
      });

      expect(searchAndSaveResultSpy).toHaveBeenCalled();
    });
  });
});
