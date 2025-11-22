-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "fileName" VARCHAR(256) NOT NULL,
    "fileUrl" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);
