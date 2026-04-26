PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`reg_no` text NOT NULL,
	`password` text,
	`gender` text NOT NULL,
	`dob` text NOT NULL,
	`program` text NOT NULL,
	`branch` text NOT NULL,
	`admission_year` text NOT NULL,
	`category` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`referred_by` text,
	`privacy_tos` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`referred_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "reg_no", "password", "gender", "dob", "program", "branch", "admission_year", "category", "phone", "email", "referred_by", "privacy_tos", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "reg_no", "password", "gender", "dob", "program", "branch", "admission_year", "category", "phone", "email", "referred_by", "privacy_tos", "created_at", "updated_at", "deleted_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_reg_no_unique` ON `users` (`reg_no`);--> statement-breakpoint
ALTER TABLE `platform_users` ADD `security_mode` text DEFAULT 'CONVENIENCE' NOT NULL;