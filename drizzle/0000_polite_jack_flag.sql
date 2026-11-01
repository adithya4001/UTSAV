CREATE TABLE `organiser_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`state` text NOT NULL,
	`status` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organiser_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`city` text NOT NULL,
	`specialty` text NOT NULL,
	`updated_at` text NOT NULL
);
