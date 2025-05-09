-- AlterTable
ALTER TABLE `health_records` ADD COLUMN `caretaker_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `medication` ADD COLUMN `caretaker_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `patient_caretaker` (
    `patient_id` INTEGER NOT NULL,
    `caretaker_id` INTEGER NOT NULL,

    PRIMARY KEY (`patient_id`, `caretaker_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patient_caretaker` ADD CONSTRAINT `patient_caretaker_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_caretaker` ADD CONSTRAINT `patient_caretaker_caretaker_id_fkey` FOREIGN KEY (`caretaker_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_records` ADD CONSTRAINT `health_records_caretaker_id_fkey` FOREIGN KEY (`caretaker_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication` ADD CONSTRAINT `medication_caretaker_id_fkey` FOREIGN KEY (`caretaker_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
