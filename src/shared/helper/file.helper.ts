import * as path from 'path';
import * as fs from 'node:fs/promises';
import { ROOT_PATH } from './constants';

export class FileHelper {
  static getAbsolutePath(relativePath: string): string {
    return path.resolve(ROOT_PATH, relativePath);
  }

  static filterCsv(req, file, callback) {
    if (!file.originalname.match(/\.(csv)$/)) {
      return callback(new Error('Only allow CSV file extension'), false);
    }
    callback(null, true);
  }

  static setUploadFileName(req, file, callback) {
    const parsedFile = path.parse(file.originalname);
    const epoch = Date.now();
    callback(null, `${parsedFile.name}-${epoch}${parsedFile.ext}`);
  }

  static createHtmlFileName(keyword: string): string {
    const epoch = Date.now();
    return `${keyword}-resultcache-${epoch}.html`;
  }

  static async dirExist(dirPath: string): Promise<boolean> {
    try {
      await fs.access(dirPath, fs.constants.O_DIRECTORY);
      return true;
    } catch (err) {
      return false;
    }
  }

  static async createDirIfNotExist(dirPath: string): Promise<void> {
    const exists = await this.dirExist(dirPath);

    if (!exists) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  static async writeResultCache(data: any, writePath: string): Promise<void> {
    try {
      await fs.writeFile(writePath, data);
    } catch (err) {
      throw err;
    }
  }
}
