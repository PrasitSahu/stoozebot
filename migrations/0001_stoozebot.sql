ALTER TABLE `users` ADD `referred_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `users` ADD `privacy_tos` integer DEFAULT false NOT NULL;