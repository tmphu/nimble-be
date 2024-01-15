-- CreateTable
CREATE TABLE "Upload" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(1000) NOT NULL,
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_result" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "keyword" VARCHAR(1000) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "result" JSONB,
    "page_snapshot_path" VARCHAR(1000),
    "upload_id" INTEGER NOT NULL,

    CONSTRAINT "search_result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "search_result" ADD CONSTRAINT "search_result_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "Upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
