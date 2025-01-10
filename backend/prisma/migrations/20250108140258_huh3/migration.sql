/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `medication` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `medication` DROP FOREIGN KEY `medication_user_id_fkey`;

-- DropIndex
DROP INDEX `medication_name_unique` ON `medication`;

-- CreateIndex
CREATE UNIQUE INDEX `medication_name_unique` ON `medication`(`user_id`);
