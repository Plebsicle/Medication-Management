/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `patientprofile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[google_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `health_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verified` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `doctor` DROP FOREIGN KEY `doctor_ibfk_1`;

-- DropForeignKey
ALTER TABLE `health_records` DROP FOREIGN KEY `health_records_ibfk_1`;

-- DropForeignKey
ALTER TABLE `medication` DROP FOREIGN KEY `medication_ibfk_1`;

-- DropForeignKey
ALTER TABLE `medication_times` DROP FOREIGN KEY `medication_times_ibfk_1`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `notification_ibfk_1`;

-- DropForeignKey
ALTER TABLE `notification_logs` DROP FOREIGN KEY `notification_logs_ibfk_1`;

-- DropForeignKey
ALTER TABLE `patientprofile` DROP FOREIGN KEY `patientprofile_ibfk_1`;

-- AlterTable
ALTER TABLE `health_records` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `google_id` VARCHAR(255) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `role` ENUM('patient', 'caregiver', 'doctor') NOT NULL DEFAULT 'patient',
    MODIFY `verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `doctor_user_id_key` ON `doctor`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `patientprofile_user_id_key` ON `patientprofile`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_google_id_key` ON `user`(`google_id`);

-- AddForeignKey
ALTER TABLE `doctor` ADD CONSTRAINT `doctor_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_records` ADD CONSTRAINT `health_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication` ADD CONSTRAINT `medication_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_times` ADD CONSTRAINT `medication_times_medication_id_fkey` FOREIGN KEY (`medication_id`) REFERENCES `medication`(`medication_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patientprofile` ADD CONSTRAINT `patientprofile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
