-- AlterTable
ALTER TABLE `user` MODIFY `password` VARCHAR(255) NULL,
    MODIFY `role` ENUM('patient', 'caregiver', 'doctor') NULL DEFAULT 'patient';
