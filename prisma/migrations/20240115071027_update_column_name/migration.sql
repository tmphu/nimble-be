/*
  Warnings:

  - You are about to drop the `Upload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "search_result" DROP CONSTRAINT "search_result_upload_id_fkey";

-- DropTable
DROP TABLE "Upload";

-- CreateTable
CREATE TABLE "upload" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(1000) NOT NULL,
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "upload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "search_result" ADD CONSTRAINT "search_result_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
