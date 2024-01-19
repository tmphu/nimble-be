import { PaginateObj } from 'src/google-scraper/dtos/google-scraper.dto';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from './constants';

export class PaginationHelper {
  static paginateFn(reqPage: string, reqPageSize: string): PaginateObj {
    const queryObj: PaginateObj = {};
    const page = parseInt(reqPage) > 0 ? parseInt(reqPage) : DEFAULT_PAGE;
    const pageSize =
      parseInt(reqPageSize) > 0 ? parseInt(reqPageSize) : DEFAULT_PAGE_SIZE;

    queryObj['skip'] = (page - 1) * pageSize;
    queryObj['take'] = pageSize;

    return queryObj;
  }
}
