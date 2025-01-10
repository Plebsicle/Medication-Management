-- DropIndex
DROP INDEX `medication_name_unique` ON `medication`;

-- CreateTable
CREATE TABLE `subscription` (
    `subscription_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `endpoint` VARCHAR(500) NOT NULL,
    `expiration_time` DATETIME(3) NULL,
    `p256dh_key` VARCHAR(500) NOT NULL,
    `auth_key` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `subscription_user_id_fkey`(`user_id`),
    PRIMARY KEY (`subscription_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
