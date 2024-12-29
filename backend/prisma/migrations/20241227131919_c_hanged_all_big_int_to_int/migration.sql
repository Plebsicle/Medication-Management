/*
  Warnings:

  - The primary key for the `doctor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `doctor_id` on the `doctor` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `emailverificationtoken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `token_id` on the `emailverificationtoken` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `health_records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `health_records_id` on the `health_records` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `medication` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `medication_id` on the `medication` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `medication_times` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `medication_time_id` on the `medication_times` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `medication_id` on the `medication_times` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `medication_id` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `patientprofile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `profile_id` on the `patientprofile` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.

*/
-- DropForeignKey
ALTER TABLE `medication_times` DROP FOREIGN KEY `medication_times_medication_id_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `notification_medication_id_fkey`;

-- AlterTable
ALTER TABLE `doctor` DROP PRIMARY KEY,
    MODIFY `doctor_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`doctor_id`);

-- AlterTable
ALTER TABLE `emailverificationtoken` DROP PRIMARY KEY,
    MODIFY `token_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`token_id`);

-- AlterTable
ALTER TABLE `health_records` DROP PRIMARY KEY,
    MODIFY `health_records_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`health_records_id`);

-- AlterTable
ALTER TABLE `medication` DROP PRIMARY KEY,
    MODIFY `medication_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`medication_id`);

-- AlterTable
ALTER TABLE `medication_times` DROP PRIMARY KEY,
    MODIFY `medication_time_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `medication_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`medication_time_id`);

-- AlterTable
ALTER TABLE `notification` MODIFY `medication_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `patientprofile` DROP PRIMARY KEY,
    MODIFY `profile_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`profile_id`);

-- AddForeignKey
ALTER TABLE `medication_times` ADD CONSTRAINT `medication_times_medication_id_fkey` FOREIGN KEY (`medication_id`) REFERENCES `medication`(`medication_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_medication_id_fkey` FOREIGN KEY (`medication_id`) REFERENCES `medication`(`medication_id`) ON DELETE CASCADE ON UPDATE CASCADE;
