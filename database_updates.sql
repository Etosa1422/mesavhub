-- ============================================
-- AFFILIATE SYSTEM DATABASE UPDATES
-- Copy and paste these SQL statements into your database
-- ============================================

-- 1. Add referred_by column to users table (if it doesn't exist)
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "referred_by";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " BIGINT UNSIGNED NULL DEFAULT NULL AFTER `api_key`, ADD INDEX `users_referred_by_index` (`referred_by`), ADD CONSTRAINT `users_referred_by_foreign` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`) ON DELETE SET NULL")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Add paid_earnings column to affiliate_stats table (if it doesn't exist)
SET @tablename2 = "affiliate_stats";
SET @columnname2 = "paid_earnings";
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename2)
      AND (COLUMN_NAME = @columnname2)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename2, " ADD COLUMN ", @columnname2, " DECIMAL(10, 2) DEFAULT 0.00 AFTER `available_earnings`")
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- 3. Create affiliate_programs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `affiliate_programs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `referral_code` VARCHAR(255) NOT NULL,
  `commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
  `minimum_payout` DECIMAL(10, 2) NOT NULL DEFAULT 2000.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `affiliate_programs_referral_code_unique` (`referral_code`),
  KEY `affiliate_programs_user_id_foreign` (`user_id`),
  CONSTRAINT `affiliate_programs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create affiliate_stats table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `affiliate_stats` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliate_program_id` BIGINT UNSIGNED NOT NULL,
  `visits` INT NOT NULL DEFAULT 0,
  `registrations` INT NOT NULL DEFAULT 0,
  `referrals` INT NOT NULL DEFAULT 0,
  `conversion_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `total_earnings` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `available_earnings` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `paid_earnings` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `affiliate_stats_affiliate_program_id_foreign` (`affiliate_program_id`),
  CONSTRAINT `affiliate_stats_affiliate_program_id_foreign` FOREIGN KEY (`affiliate_program_id`) REFERENCES `affiliate_programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create affiliate_payouts table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `affiliate_payouts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliate_program_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `transaction_id` VARCHAR(255) NULL DEFAULT NULL,
  `payment_method` VARCHAR(255) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `affiliate_payouts_affiliate_program_id_foreign` (`affiliate_program_id`),
  CONSTRAINT `affiliate_payouts_affiliate_program_id_foreign` FOREIGN KEY (`affiliate_program_id`) REFERENCES `affiliate_programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create affiliate_referrals table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `affiliate_referrals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliate_program_id` BIGINT UNSIGNED NOT NULL,
  `referred_user_id` BIGINT UNSIGNED NOT NULL,
  `commission_earned` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `affiliate_referrals_affiliate_program_id_foreign` (`affiliate_program_id`),
  KEY `affiliate_referrals_referred_user_id_foreign` (`referred_user_id`),
  CONSTRAINT `affiliate_referrals_affiliate_program_id_foreign` FOREIGN KEY (`affiliate_program_id`) REFERENCES `affiliate_programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `affiliate_referrals_referred_user_id_foreign` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- END OF SQL UPDATES
-- ============================================

