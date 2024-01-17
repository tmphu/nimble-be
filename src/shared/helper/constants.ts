import * as path from 'path';

export const UPLOADS_DIR_NAME = 'uploads';

export const CACHE_DIR_NAME = 'result-cache';

export const DEFAULT_NAVIGATION_TIMEOUT_IN_MILLISECONDS = 30 * 1000; // 30 seconds

export const DEFAULT_PAGE_SCROLL_TIMEOUT_IN_MILLISECONDS = 5 * 1000; // 5 seconds

export const DEFAULT_PAGE = 1;

export const DEFAULT_PAGE_SIZE = 10;

export const CHUNK_SIZE = 5;

export const ROOT_PATH = path.resolve(process.cwd());
