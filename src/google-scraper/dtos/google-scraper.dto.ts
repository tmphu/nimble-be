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

export class UploadDto extends CreateUploadResponseDto {}

export class UploadPaginate {
  uploads: UploadDto[];
  total: number;
}

export class SearchUploadRequestDto {
  searchStr: string;
  page: string;
  pageSize: string;
  status: string;
  orders: string;
}

export class SearchResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  keyword: string;
  searchedAt?: Date;
  searchEngine: string;
  status: string;
  result?: SearchData | Record<string, any>;
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
  totalNumberOfAdWords: number;
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
