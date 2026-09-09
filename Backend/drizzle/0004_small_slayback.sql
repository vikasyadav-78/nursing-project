CREATE TABLE `universities` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`location` varchar(255),
	`established_year` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `universities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`state_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	CONSTRAINT `states_id` PRIMARY KEY(`id`),
	CONSTRAINT `states_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `placements` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`college_id` varchar(36) NOT NULL,
	`year` int NOT NULL,
	`highest_package` varchar(50),
	`average_package` varchar(50),
	`top_recruiters` json DEFAULT (JSON_ARRAY()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `placements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`college_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`user_name` varchar(150),
	`rating` float NOT NULL,
	`comment` text,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`rejection_reason` text,
	`moderated_at` timestamp,
	`moderated_by` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scholarships` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`college_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`amount` varchar(100),
	`eligibility` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `scholarships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `college_courses` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`college_id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`total_fees` varchar(100),
	`seats` int,
	`cutoff` varchar(100),
	CONSTRAINT `college_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_exams` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`course_id` varchar(36) NOT NULL,
	`exam_id` varchar(36) NOT NULL,
	`is_mandatory` boolean DEFAULT true,
	CONSTRAINT `course_exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_colleges` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`exam_id` varchar(36) NOT NULL,
	`college_id` varchar(36) NOT NULL,
	`accepting_status` varchar(100) DEFAULT 'Accepted',
	CONSTRAINT `exam_colleges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_colleges` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`college_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_colleges_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_college_unique` UNIQUE(`user_id`,`college_id`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36),
	`event_type` varchar(50) NOT NULL,
	`metadata` json DEFAULT (JSON_OBJECT()),
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `mobile` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(150);--> statement-breakpoint
ALTER TABLE `users` ADD `education_level` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `course_preferences` json DEFAULT (JSON_ARRAY());--> statement-breakpoint
ALTER TABLE `users` ADD `exam_preferences` json DEFAULT (JSON_ARRAY());--> statement-breakpoint
ALTER TABLE `users` ADD `budget` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `career_interests` json DEFAULT (JSON_ARRAY());--> statement-breakpoint
ALTER TABLE `colleges` ADD `stream` varchar(100);--> statement-breakpoint
ALTER TABLE `colleges` ADD `rating` varchar(10);--> statement-breakpoint
ALTER TABLE `colleges` ADD `nirf_rank` varchar(50);--> statement-breakpoint
ALTER TABLE `colleges` ADD `min_fee` int;--> statement-breakpoint
ALTER TABLE `colleges` ADD `max_fee` int;--> statement-breakpoint
ALTER TABLE `colleges` ADD `tuition_fees_display` varchar(100);--> statement-breakpoint
ALTER TABLE `colleges` ADD `exams_accepted` json DEFAULT (JSON_ARRAY());--> statement-breakpoint
ALTER TABLE `colleges` ADD `accreditation` varchar(100);--> statement-breakpoint
ALTER TABLE `colleges` ADD `brochure_url` text;--> statement-breakpoint
ALTER TABLE `colleges` ADD `specialization` varchar(255);--> statement-breakpoint
ALTER TABLE `colleges` ADD `program_mode` varchar(50);--> statement-breakpoint
ALTER TABLE `colleges` ADD `course_type` varchar(50);--> statement-breakpoint
ALTER TABLE `courses` ADD `is_trending` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `exams` ADD `is_trending` boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX `univ_name_idx` ON `universities` (`name`);--> statement-breakpoint
CREATE INDEX `city_state_idx` ON `cities` (`state_id`);--> statement-breakpoint
CREATE INDEX `city_name_idx` ON `cities` (`name`);--> statement-breakpoint
CREATE INDEX `state_name_idx` ON `states` (`name`);--> statement-breakpoint
CREATE INDEX `placement_college_idx` ON `placements` (`college_id`);--> statement-breakpoint
CREATE INDEX `review_college_idx` ON `reviews` (`college_id`);--> statement-breakpoint
CREATE INDEX `scholarship_college_idx` ON `scholarships` (`college_id`);--> statement-breakpoint
CREATE INDEX `cc_college_idx` ON `college_courses` (`college_id`);--> statement-breakpoint
CREATE INDEX `cc_course_idx` ON `college_courses` (`course_id`);--> statement-breakpoint
CREATE INDEX `ce_course_idx` ON `course_exams` (`course_id`);--> statement-breakpoint
CREATE INDEX `ce_exam_idx` ON `course_exams` (`exam_id`);--> statement-breakpoint
CREATE INDEX `ec_exam_idx` ON `exam_colleges` (`exam_id`);--> statement-breakpoint
CREATE INDEX `ec_college_idx` ON `exam_colleges` (`college_id`);--> statement-breakpoint
CREATE INDEX `saved_user_idx` ON `saved_colleges` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_event_idx` ON `activity_logs` (`user_id`,`event_type`);--> statement-breakpoint
CREATE INDEX `activity_created_idx` ON `activity_logs` (`created_at`);