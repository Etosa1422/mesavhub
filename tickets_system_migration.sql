-- ============================================
-- Tickets System - SQL Migration
-- Copy and paste this into phpMyAdmin or MySQL
-- ============================================

-- Step 1: Check if tickets table exists, if not create it
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `category_id` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `request_type` VARCHAR(255) NOT NULL,
  `order_ids` TEXT NULL DEFAULT NULL,
  `message` TEXT NULL DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Answered, 2=In Progress, 3=Closed',
  `priority` TINYINT NOT NULL DEFAULT 1 COMMENT '1=Low, 2=Medium, 3=High',
  `last_reply` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tickets_user_id_index` (`user_id`),
  KEY `tickets_status_index` (`status`),
  KEY `tickets_created_at_index` (`created_at`),
  CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Create ticket_replies table for storing replies
CREATE TABLE IF NOT EXISTS `ticket_replies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'NULL for admin replies',
  `admin_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'NULL for user replies',
  `message` TEXT NOT NULL,
  `is_internal` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Internal notes visible only to admins',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_replies_ticket_id_index` (`ticket_id`),
  KEY `ticket_replies_user_id_index` (`user_id`),
  KEY `ticket_replies_admin_id_index` (`admin_id`),
  KEY `ticket_replies_created_at_index` (`created_at`),
  CONSTRAINT `ticket_replies_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ticket_replies_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Add priority column if it doesn't exist
ALTER TABLE `tickets` 
ADD COLUMN IF NOT EXISTS `priority` TINYINT NOT NULL DEFAULT 1 COMMENT '1=Low, 2=Medium, 3=High' AFTER `status`;

-- Step 4: Update status values (0=Pending, 1=Answered, 2=In Progress, 3=Closed)
-- This is just a comment - status column should already exist

-- ============================================
-- END OF SQL MIGRATION
-- ============================================

