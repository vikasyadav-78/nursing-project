ALTER TABLE `blogs` ADD `content_type` varchar(50) DEFAULT 'Article' NOT NULL;--> statement-breakpoint
ALTER TABLE `blogs` ADD `status` varchar(30) DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE `blogs` ADD `author_id` varchar(36);--> statement-breakpoint
ALTER TABLE `blogs` ADD `author_name` varchar(150);--> statement-breakpoint
ALTER TABLE `blogs` ADD `published_at` timestamp;--> statement-breakpoint
ALTER TABLE `blogs` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;