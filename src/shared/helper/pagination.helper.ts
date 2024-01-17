import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from './constants';

export const paginateFn = (reqPage: string, reqPageSize: string) => {
  const queryObj = {};
  const page = parseInt(reqPage) > 0 ? parseInt(reqPage) : DEFAULT_PAGE;
  const pageSize =
    parseInt(reqPageSize) > 0 ? parseInt(reqPageSize) : DEFAULT_PAGE_SIZE;

  queryObj['skip'] = (page - 1) * pageSize;
  queryObj['take'] = pageSize;

  return queryObj;
};