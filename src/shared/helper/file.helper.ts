import { parse, join, extname } from 'path';

export const csvFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(new Error('Only allow CSV file extension'), false);
  }
  callback(null, true);
};

export const csvFileName = (req, file, callback) => {
  const parsedFile = parse(file.originalname);
  const epoch = Date.now();
  callback(null, `${parsedFile.name}-${epoch}${parsedFile.ext}`);
};

export const htmlCacheFileName = (keyword) => {
  const epoch = Date.now();
  return `${keyword}-resultcache-${epoch}.html`;
};

export const getFilePath = (filename) => {
  return join(process.cwd(), 'uploads', filename);
};

export const writeFilePath = (filename) => {
  return join(process.cwd(), 'result-cache', filename);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
