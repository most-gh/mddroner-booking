ALTER TABLE `bookings` MODIFY COLUMN `route` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `notes` text;