/*
  Warnings:

  - The primary key for the `notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `acknowledged` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `remind_at` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `repeat_frequency` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notification` table. All the data in the column will be lost.
  - You are about to alter the column `notification_id` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `UnsignedInt`.
  - The primary key for the `notification_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `acknowledged` on the `notification_logs` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `notification_logs` table. All the data in the column will be lost.
  - You are about to drop the column `notification_log_id` on the `notification_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notification_logs` table. All the data in the column will be lost.
  - Added the required column `medication_id` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `log_id` to the `notification_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notification_id` to the `notification_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `notification_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `notification_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `notification_logs` DROP FOREIGN KEY `notification_logs_user_id_fkey`;

-- AlterTable
ALTER TABLE `notification` DROP PRIMARY KEY,
    DROP COLUMN `acknowledged`,
    DROP COLUMN `remind_at`,
    DROP COLUMN `repeat_frequency`,
    DROP COLUMN `user_id`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `medication_id` BIGINT UNSIGNED NOT NULL,
    ADD COLUMN `notification_on` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `notification_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    MODIFY `message` TEXT NOT NULL,
    ADD PRIMARY KEY (`notification_id`);

-- AlterTable
ALTER TABLE `notification_logs` DROP PRIMARY KEY,
    DROP COLUMN `acknowledged`,
    DROP COLUMN `message`,
    DROP COLUMN `notification_log_id`,
    DROP COLUMN `user_id`,
    ADD COLUMN `log_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD COLUMN `notification_id` INTEGER UNSIGNED NOT NULL,
    ADD COLUMN `status` VARCHAR(50) NOT NULL,
    MODIFY `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD PRIMARY KEY (`log_id`);

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_medication_id_fkey` FOREIGN KEY (`medication_id`) REFERENCES `medication`(`medication_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notification`(`notification_id`) ON DELETE CASCADE ON UPDATE CASCADE;
