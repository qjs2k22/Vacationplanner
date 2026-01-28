// src/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Trips table - stores trip information
export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Trip details
  name: text('name').notNull(),
  description: text('description'),

  // Trip date range - MUST use timestamptz (withTimezone: true)
  // This prevents DST bugs and ensures correct date handling
  startDate: timestamp('start_date', {
    withTimezone: true,
    mode: 'date',  // Returns JavaScript Date objects
  }).notNull(),

  endDate: timestamp('end_date', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),

  // Audit timestamps
  createdAt: timestamp('created_at', {
    withTimezone: true,
  }).notNull().defaultNow(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  }).notNull().defaultNow(),
});

// Type exports for use in queries and components
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
