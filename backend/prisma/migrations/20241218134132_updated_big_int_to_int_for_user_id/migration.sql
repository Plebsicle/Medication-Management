/*
  Warnings:

  - You are about to alter the column `user_id` on the `doctor` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `emailverificationtoken` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `health_records` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `medication` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `notification_logs` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - You are about to alter the column `user_id` on the `patientprofile` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.

*/
-- DropForeignKey
ALTER TABLE `doctor` DROP FOREIGN KEY `doctor_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `emailverificationtoken` DROP FOREIGN KEY `EmailVerificationToken_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `health_records` DROP FOREIGN KEY `health_records_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `medication` DROP FOREIGN KEY `medication_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `notification_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `notification_logs` DROP FOREIGN KEY `notification_logs_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `patientprofile` DROP FOREIGN KEY `patientprofile_user_id_fkey`;

-- AlterTable
ALTER TABLE `doctor` MODIFY `user_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `emailverificationtoken` MODIFY `user_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `health_records` MODIFY `user_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `medication` MODIFY `user_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `notification` MODIFY `user_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `notification_logs` MODIFY `user_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `patientprofile` MODIFY `user_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `doctor` ADD CONSTRAINT `doctor_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_records` ADD CONSTRAINT `health_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication` ADD CONSTRAINT `medication_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patientprofile` ADD CONSTRAINT `patientprofile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailVerificationToken` ADD CONSTRAINT `EmailVerificationToken_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
