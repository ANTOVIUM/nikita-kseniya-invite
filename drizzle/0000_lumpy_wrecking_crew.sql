CREATE TABLE `responses` (
	`request_id` text PRIMARY KEY NOT NULL,
	`submitted_at` text NOT NULL,
	`name` text NOT NULL,
	`attendance` text NOT NULL,
	`drinks` text DEFAULT '' NOT NULL,
	`food` text DEFAULT '' NOT NULL,
	`lodging` text DEFAULT '' NOT NULL,
	`payload_hash` text NOT NULL
);
