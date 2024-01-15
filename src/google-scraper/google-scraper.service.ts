import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import {
  CreateUploadDto,
  SearchEngine,
  SearchRequestDto,
  SearchSingleKeywordResultDto,
  SearchStatus,
  UploadStatus,
} from './dtos/google-scraper.dto';
import { scrollPageFn } from 'src/shared/helper/page.helper';
import {
  htmlCacheFileName,
  writeFilePath,
} from 'src/shared/helper/file.helper';

const DEFAULT_NAVIGATION_TIMEOUT_IN_MILLISECONDS = 30 * 1000; // 30 seconds
const DEFAULT_PAGE_SCROLL_TIMEOUT_IN_MILLISECONDS = 5 * 1000; // 5 seconds
const CHUNK_SIZE = 5;

@Injectable()
export class GoogleScraperService {
  private prisma = new PrismaClient();

  // upload file
  async uploadFile(fileDto: CreateUploadDto): Promise<any> {
    fs.readFile(fileDto.filePath, 'utf8', async (err, content) => {
      if (err) {
        throw new InternalServerErrorException(
          'error when importing upload file',
          err.message,
        );
      }

      try {
        const response = await this.prisma.upload.create({
          data: {
            fileName: fileDto.fileName,
            filePath: fileDto.filePath,
            status: UploadStatus.Uploaded,
            searchResults: {
              createMany: {
                data: content.split('\n').map((keyword) => {
                  return {
                    keyword: keyword.trimEnd(),
                    status: SearchStatus.Waiting,
                    searchEngine: SearchEngine.Google,
                  };
                }),
              },
            },
          },
        });

        this.searchAndSaveResult(response.id);

        return response;
      } catch (err) {
        throw new InternalServerErrorException(
          'error when inserting upload records',
          err,
        );
      }
    });
  }

  // search all keywords in each upload
  async searchAndSaveResult(uploadId: number): Promise<void> {
    const keywords: SearchRequestDto[] =
      await this.prisma.searchResult.findMany({
        select: {
          id: true,
          keyword: true,
          status: true,
          searchEngine: true,
        },
        where: {
          uploadId: uploadId,
          status: {
            not: SearchStatus.Completed,
          },
        },
      });

    try {
      const res = await this.processSearchInChunks(keywords);
      await this.prisma.$transaction(
        res.map((el: SearchSingleKeywordResultDto) => {
          return this.prisma.searchResult.updateMany({
            where: {
              id: el.id,
            },
            data: {
              searchedAt: el.searchedAt,
              status: el.status,
              result: el.result as any as Prisma.JsonValue,
              pageSnapshotPath: el.pageSnapshotPath,
            },
          });
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException(
        'error searching keyword in search engine',
        err,
      );
    }
  }

  // search single keyword
  async searchSingleKeyword(
    id: number,
    keyword: string,
  ): Promise<SearchSingleKeywordResultDto> {
    const browser = await puppeteer.launch({
      headless: false,
    });
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(
        DEFAULT_NAVIGATION_TIMEOUT_IN_MILLISECONDS,
      );

      await Promise.all([
        page.waitForNavigation(),
        page.goto(SearchEngine.Google),
        page.setViewport({ width: 1080, height: 1024 }),
      ]);

      Logger.debug(`start searching for keyword: ${keyword}`);

      await Promise.all([
        page.waitForNavigation(),
        await page.type('textarea[name="q"]', keyword),
        await page.keyboard.press('Enter'),
        await scrollPageFn(DEFAULT_PAGE_SCROLL_TIMEOUT_IN_MILLISECONDS, page),
      ]);

      const stat = await page.$eval('#result-stats', (el: any) =>
        el.innerText?.trimEnd(),
      );
      console.log('stat', stat);
      const allLinks = await page.$$('a[href]');
      console.log('allLinks', allLinks.length);

      const rawHtml = await page.content();

      const cachePath = writeFilePath(htmlCacheFileName(keyword));
      this.writeResultCache(rawHtml, cachePath);

      Logger.debug(`Complete searching for keyword: ${keyword}`);
      return {
        id: id,
        keyword: keyword,
        searchedAt: new Date(),
        status: SearchStatus.Completed,
        result: {
          totalNumberOfAdWords: 1,
          totalNumberOfLinks: allLinks.length,
          totalSearchResult: stat,
        },
        pageSnapshotPath: cachePath,
      };
    } catch (err) {
      Logger.debug(`error searching keyword ${keyword}: ${err}`);
      return {
        id: id,
        keyword: keyword,
        searchedAt: new Date(),
        status: SearchStatus.Error,
        result: { error: `${err}` },
      };
    } finally {
      await browser.close();
    }
  }

  async writeResultCache(data: any, writePath: string): Promise<any> {
    fs.writeFile(writePath, data, (err) => {
      if (err) {
        throw new InternalServerErrorException(
          'error when writing result cache',
          err.message,
        );
      }
    });
  }

  async processSearchInChunks(
    keywords: SearchRequestDto[] = [],
  ): Promise<SearchSingleKeywordResultDto[]> {
    const results = [];
    for (let i = 0; i < keywords.length; i += CHUNK_SIZE) {
      const chunk = keywords.slice(i, i + CHUNK_SIZE);
      const res = await Promise.all(
        chunk.map((el) => {
          return this.searchSingleKeyword(el.id, el.keyword);
        }),
      );
      results.push(...res);
    }
    return results;
  }
}
