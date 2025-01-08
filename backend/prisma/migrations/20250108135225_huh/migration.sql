/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `medication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `medication_name_key` ON `medication`(`name`);
