-- CreateTable
CREATE TABLE "medicalDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medicalDocument_userId_idx" ON "medicalDocument"("userId");

-- AddForeignKey
ALTER TABLE "medicalDocument" ADD CONSTRAINT "medicalDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
