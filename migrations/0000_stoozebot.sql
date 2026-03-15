CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`reg_no` text NOT NULL,
	`password` text NOT NULL,
	`gender` text NOT NULL,
	`dob` text NOT NULL,
	`program` text NOT NULL,
	`branch` text NOT NULL,
	`admission_year` text NOT NULL,
	`category` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_reg_no_unique` ON `users` (`reg_no`);--> statement-breakpoint
CREATE TABLE `api_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`reqs` integer DEFAULT 0 NOT NULL,
	`max` integer NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_limits_platform_unique` ON `api_limits` (`platform`);--> statement-breakpoint
CREATE TABLE `attendances` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slno` integer NOT NULL,
	`percentage` text NOT NULL,
	`total` text NOT NULL,
	`subject` text NOT NULL,
	`subject_code` text NOT NULL,
	`sem` text NOT NULL,
	`reg_code` text NOT NULL,
	`reg_id` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendances_user_id_subject_code_reg_code_reg_id_unique` ON `attendances` (`user_id`,`subject_code`,`reg_code`,`reg_id`);--> statement-breakpoint
CREATE TABLE `platform_users` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`platform` text NOT NULL,
	`platform_id` text NOT NULL,
	`reqs` integer DEFAULT 0 NOT NULL,
	`last_req_at` text DEFAULT (datetime('now')) NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platform_users_platform_platform_id_unique` ON `platform_users` (`platform`,`platform_id`);--> statement-breakpoint
CREATE TABLE `auth_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_tokens_user_id_unique` ON `auth_tokens` (`user_id`);