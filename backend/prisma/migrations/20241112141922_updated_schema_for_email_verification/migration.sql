-- AlterTable
ALTER TABLE `user` MODIFY `verified` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `EmailVerificationToken` (
    `token_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expiration` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailVerificationToken_user_id_key`(`user_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmailVerificationToken` ADD CONSTRAINT `EmailVerificationToken_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
