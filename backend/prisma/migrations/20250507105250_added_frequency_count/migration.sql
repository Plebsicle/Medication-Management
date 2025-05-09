/*
  Warnings:

  - You are about to drop the `caregiver_patient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `caregiver_patient` DROP FOREIGN KEY `caregiver_patient_caregiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `caregiver_patient` DROP FOREIGN KEY `caregiver_patient_patient_id_fkey`;

-- AlterTable
ALTER TABLE `medication` ADD COLUMN `frequency` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `caregiver_patient`;
