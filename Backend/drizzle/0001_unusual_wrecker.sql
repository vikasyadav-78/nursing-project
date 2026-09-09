CREATE TABLE `exams` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`code` varchar(100) NOT NULL,
	`category` varchar(100),
	`exam_level` varchar(50) DEFAULT 'National',
	`description` text,
	`application_start_date` timestamp DEFAULT null,
	`application_end_date` timestamp DEFAULT null,
	`exam_date` timestamp DEFAULT null,
	`result_date` timestamp DEFAULT null,
	`official_website` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exams_id` PRIMARY KEY(`id`),
	CONSTRAINT `exams_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE INDEX `exam_name_idx` ON `exams` (`name`);--> statement-breakpoint
CREATE INDEX `exam_code_idx` ON `exams` (`code`);--> statement-breakpoint
CREATE INDEX `exam_category_idx` ON `exams` (`category`);