import { JsonValue } from '@prisma/client/runtime/library';

export enum UploadStatus {
  Uploaded = 'UPLOADED',
  Error = 'ERROR',
}

export enum SearchStatus {
  Waiting = 'WAITING',
  Searching = 'SEARCHING',
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export enum SearchEngine {
  Google = 'https://google.com',
}

export type PaginateObj = { skip?: number; take?: number };
export type QueryObj = {
  where?: Record<string, any>;
  orderBy?: Record<string, any>;
  select?: Record<string, any>;
};

export class Upload {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  fileName: string;
  filePath: string;
  status: string;
}

export class CreateUploadRequestDto {
  fileName: string;
  filePath: string;
}

export class CreateUploadResponseDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  fileName: string;
  status: string;
}

export class UploadDto extends CreateUploadResponseDto {
  filePath: string;
}

export class Paginate<T> {
  data: T[];
  total: number;
}

export class SearchUploadRequestDto {
  searchStr: string;
  page: string;
  pageSize: string;
  status: string;
  orders: string;
}

export class SearchResultRequestDto extends SearchUploadRequestDto {}

export class SearchResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  keyword: string;
  searchedAt?: Date;
  searchEngine: string;
  status: string;
  result?: SearchData | JsonValue;
  pageSnapshotPath?: string;
  uploadId: number;
}

export class SearchRequestDto {
  id: number;
  keyword: string;
  searchEngine: string;
  status: string;
}

export class SearchData {
  totalNumberOfAdWordsAdvertisers: number;
  totalNumberOfLinks: number;
  totalSearchResult: string;
}

export class SearchSingleKeywordResultDto {
  id: number;
  keyword: string;
  searchedAt?: Date;
  status: string;
  result?: SearchData | Record<string, any>;
  pageSnapshotPath?: string;
}
