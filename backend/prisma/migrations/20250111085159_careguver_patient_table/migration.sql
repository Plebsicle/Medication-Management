-- CreateTable
CREATE TABLE `caregiver_patient` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `caregiver_id` INTEGER UNSIGNED NOT NULL,
    `patient_id` INTEGER UNSIGNED NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `caregiver_id_idx`(`caregiver_id`),
    INDEX `patient_id_idx`(`patient_id`),
    UNIQUE INDEX `caregiver_patient_unique`(`caregiver_id`, `patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `caregiver_patient` ADD CONSTRAINT `caregiver_patient_caregiver_id_fkey` FOREIGN KEY (`caregiver_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caregiver_patient` ADD CONSTRAINT `caregiver_patient_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
