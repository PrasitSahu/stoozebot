CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`sem` real NOT NULL,
	`sgpa` real NOT NULL,
	`cgpa` real NOT NULL,
	`prograde` real NOT NULL,
	`credits` real NOT NULL,
	`doc` text,
	`sem_desc` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `results_user_id_sem_unique` ON `results` (`user_id`,`sem`);