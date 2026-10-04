import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const responses = sqliteTable('responses', {
  requestId: text('request_id').primaryKey(),
  submittedAt: text('submitted_at').notNull(),
  name: text('name').notNull(),
  attendance: text('attendance').notNull(),
  drinks: text('drinks').notNull().default(''),
  food: text('food').notNull().default(''),
  lodging: text('lodging').notNull().default(''),
  payloadHash: text('payload_hash').notNull(),
  isTest: integer('is_test').notNull().default(0),
});

export const limits = sqliteTable('submission_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(1),
  expiresAt: integer('expires_at').notNull(),
});
