/*
  Warnings:

  - Made the column `search_engine` on table `search_result` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "search_result" ALTER COLUMN "search_engine" SET NOT NULL;
