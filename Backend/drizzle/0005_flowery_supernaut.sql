ALTER TABLE `leads` MODIFY COLUMN `message` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `status` varchar(50) DEFAULT 'NEW' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `score` int DEFAULT 50;--> statement-breakpoint
ALTER TABLE `leads` ADD `counsellor_id` varchar(36);--> statement-breakpoint
ALTER TABLE `leads` ADD `counsellor_name` varchar(150);--> statement-breakpoint
ALTER TABLE `leads` ADD `follow_up_date` timestamp;--> statement-breakpoint
ALTER TABLE `leads` ADD `follow_up_notes` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `activity_history` json DEFAULT (JSON_ARRAY());--> statement-breakpoint
ALTER TABLE `leads` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;