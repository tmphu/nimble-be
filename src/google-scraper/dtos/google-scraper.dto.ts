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

export class CreateUploadDto {
  fileName: string;
  filePath: string;
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
