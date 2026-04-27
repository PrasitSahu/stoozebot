CREATE TABLE `timetables` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`reg_code` text NOT NULL,
	`reg_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `timetables_user_id_reg_id_unique` ON `timetables` (`user_id`,`reg_id`);