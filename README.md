## Description
Backend for Nimble WebScraper app.

Technologies:
1. Framework: Nestjs
2. Testing framework: Jest
3. Authentication: JWT
4. ORM: Prisma
5. Database: PostgreSQL
6. Browser control: Puppeteer

## Main Features
1. Log in: ```POST``` ```/api/v1/auth/login```
2. Sign up: ```POST``` ```/api/v1/auth/signup```
3. Upload keyword files: ```POST``` ```/api/v1/scraper/google/uploads```

Notes:
* file extension: .csv
* each keyword on a newline

4. Search uploads file: ```GET``` ```/api/v1/scraper/google/uploads/search```
5. Search results: ```GET``` ```/api/v1/scraper/google/results/search```

## Installation

```bash
$ yarn install
$ cp .env.example .env
```

## Migrate Database
1. Prepare DB
```bash
CREATE USER nb_admin with PASSWORD 'nimble456';
ALTER USER nb_admin CREATEDB;
CREATE DATABASE nimble;
GRANT ALL PRIVILEGES ON DATABASE nimble TO nb_admin;
```
2. Run migration
```bash
$ npx prisma db push
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

## Test

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```
