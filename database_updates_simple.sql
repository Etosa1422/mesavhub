-- ============================================
-- AFFILIATE SYSTEM DATABASE UPDATES (SIMPLE VERSION)
-- Copy and paste these SQL statements into phpMyAdmin or MySQL
-- Run them one by one if you get errors
-- ============================================

-- Step 1: Add referred_by column to users table
ALTER TABLE `users` 
ADD COLUMN `referred_by` BIGINT UNSIGNED NULL DEFAULT NULL AFTER `api_key`;

ALTER TABLE `users`
ADD INDEX `users_referred_by_index` (`referred_by`);

ALTER TABLE `users`
ADD CONSTRAINT `users_referred_by_foreign` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Step 2: Create affiliate_programs table
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

-- Step 3: Create affiliate_stats table
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

-- Step 4: Create affiliate_payouts table
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

-- Step 5: Create affiliate_referrals table
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

-- Step 6: If paid_earnings column doesn't exist in affiliate_stats, add it
-- (Run this only if Step 3 gives an error that table already exists)
ALTER TABLE `affiliate_stats` 
ADD COLUMN `paid_earnings` DECIMAL(10, 2) DEFAULT 0.00 AFTER `available_earnings`;

-- Step 7: Create general_notifications table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `general_notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `type` VARCHAR(255) NULL DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(255) NULL DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `general_notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `general_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 8: Create service_updates table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `service_updates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service` VARCHAR(255) NOT NULL,
  `details` TEXT NOT NULL,
  `date` DATE NOT NULL,
  `update` TEXT NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_updates_date_index` (`date`),
  KEY `service_updates_category_index` (`category`),
  KEY `service_updates_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- END OF SQL UPDATES
-- ============================================

