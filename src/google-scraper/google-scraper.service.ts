import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import puppeteer from 'puppeteer';
import {
  CreateUploadRequestDto,
  CreateUploadResponseDto,
  Paginate,
  QueryObj,
  SearchEngine,
  SearchRequestDto,
  SearchResult,
  SearchResultRequestDto,
  SearchSingleKeywordResultDto,
  SearchStatus,
  SearchUploadRequestDto,
  UploadDto,
  UploadStatus,
} from './dtos/google-scraper.dto';
import { scrollPageFn } from 'src/shared/helper/search.helper';
import { FileHelper } from 'src/shared/helper/file.helper';
import { paginateFn } from 'src/shared/helper/pagination.helper';
import {
  CACHE_DIR_NAME,
  CHUNK_SIZE,
  DEFAULT_NAVIGATION_TIMEOUT_IN_MILLISECONDS,
  DEFAULT_PAGE_SCROLL_TIMEOUT_IN_MILLISECONDS,
} from 'src/shared/helper/constants';

@Injectable()
export class GoogleScraperService {
  private prisma = new PrismaClient();

  private cacheDir = CACHE_DIR_NAME;

  // upload file
  async uploadFile(
    fileDto: CreateUploadRequestDto,
  ): Promise<CreateUploadResponseDto> {
    try {
      const fileContent = await fs.readFile(fileDto.filePath, 'utf8');

      const response = await this.prisma.upload.create({
        data: {
          fileName: fileDto.fileName,
          filePath: fileDto.filePath,
          status: UploadStatus.Uploaded,
          searchResults: {
            createMany: {
              data: fileContent.split('\n').map((keyword) => {
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

      return {
        id: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        fileName: response.fileName,
        status: response.status,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'error when inserting upload records',
        err,
      );
    }
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
      await this.processSearchInChunks(keywords);
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
      headless: 'new',
    });
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(
        DEFAULT_NAVIGATION_TIMEOUT_IN_MILLISECONDS,
      );

      await Promise.all([
        page.waitForNavigation(),
        page.goto(SearchEngine.Google),
        // page.setViewport({ width: 1080, height: 1024 }),
      ]);

      Logger.debug(`start searching for keyword: ${keyword}`);

      await Promise.all([
        page.waitForNavigation(),
        await page.type('textarea[name="q"]', keyword),
        await page.keyboard.press('Enter'),
        await scrollPageFn(DEFAULT_PAGE_SCROLL_TIMEOUT_IN_MILLISECONDS, page),
      ]);

      const adDivs = await page.$$eval('div[data-dtld]', (divs: any) => {
        return divs.map((div) => div.getAttribute('data-dtld'));
      });

      const adSpans = await page.$$eval('span[data-dtld]', (divs: any) => {
        return divs.map((div) => div.getAttribute('data-dtld'));
      });

      const advertiserSet = new Set([...adDivs, ...adSpans]);

      const stat = await page.$eval('#result-stats', (el: any) =>
        el.innerText?.trimEnd(),
      );
      const allLinks = await page.$$('a[href]');

      // save raw HTML
      const rawHtml = await page.content();
      const cachePath = FileHelper.getAbsolutePath(
        `${this.cacheDir}/${FileHelper.createHtmlFileName(keyword)}`,
      );
      await FileHelper.writeResultCache(rawHtml, cachePath);

      Logger.debug(`Complete searching for keyword: ${keyword}`);
      return {
        id: id,
        keyword: keyword,
        searchedAt: new Date(),
        status: SearchStatus.Completed,
        result: {
          totalNumberOfAdWordsAdvertisers: advertiserSet.size,
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

  async processSearchInChunks(
    keywords: SearchRequestDto[] = [],
  ): Promise<void> {
    for (let i = 0; i < keywords.length; i += CHUNK_SIZE) {
      const chunk = keywords.slice(i, i + CHUNK_SIZE);
      const res = await Promise.all(
        chunk.map((el) => {
          return this.searchSingleKeyword(el.id, el.keyword);
        }),
      );

      // update result in chunk
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
    }
  }

  async searchUploads(
    payload: SearchUploadRequestDto,
  ): Promise<Paginate<UploadDto>> {
    try {
      const queryObj: QueryObj = {};
      const whereObj: Record<string, any> = {};
      let orderByObj: Record<string, any> = {
        id: 'desc',
      };

      if (payload.searchStr) {
        whereObj['fileName'] = {
          contains: payload.searchStr,
          mode: 'insensitive',
        };
      }

      if (
        payload.status &&
        Object.values(UploadStatus).includes(payload.status as UploadStatus)
      ) {
        whereObj['status'] = {
          equals: payload.status,
        };
      }

      if (Object.keys(whereObj).length > 0) {
        queryObj['where'] = whereObj;
      }

      const count = await this.prisma.upload.count(queryObj);

      if (payload.orders) {
        const [key, val] = payload.orders.split('*');
        orderByObj = {
          [key]: val,
        };
      }
      queryObj['orderBy'] = orderByObj;

      const uploadRecords: UploadDto[] = await this.prisma.upload.findMany({
        ...queryObj,
        ...paginateFn(payload.page, payload.pageSize),
      });

      return {
        data: uploadRecords,
        total: count,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'error when searching upload records',
        err,
      );
    }
  }

  async searchResults(
    payload: SearchResultRequestDto,
  ): Promise<Paginate<SearchResult>> {
    try {
      const queryObj: QueryObj = {};
      const whereObj: Record<string, any> = {};
      let orderByObj: Record<string, any> = {
        id: 'desc',
      };

      if (payload.searchStr) {
        whereObj['keyword'] = {
          contains: payload.searchStr,
          mode: 'insensitive',
        };
      }

      if (
        payload.status &&
        [SearchStatus.Completed, SearchStatus.Error].includes(
          payload.status as SearchStatus,
        )
      ) {
        whereObj['status'] = {
          equals: payload.status,
        };
      }

      if (Object.keys(whereObj).length > 0) {
        queryObj['where'] = whereObj;
      }

      const count = await this.prisma.searchResult.count(queryObj);

      if (payload.orders) {
        const [key, val] = payload.orders.split('*');
        orderByObj = {
          [key]: val,
        };
      }
      queryObj['orderBy'] = orderByObj;

      const data: SearchResult[] = await this.prisma.searchResult.findMany({
        ...queryObj,
        ...paginateFn(payload.page, payload.pageSize),
      });

      return {
        data: data,
        total: count,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'error when searching result records',
        err,
      );
    }
  }
}
