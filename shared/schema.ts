import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Live events table
export const liveEvents = pgTable("live_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  eventDate: timestamp("event_date").notNull(),
  discussionGuide: text("discussion_guide").notNull(),
});

export const insertLiveEventSchema = createInsertSchema(liveEvents).omit({
  id: true,
});

// On-demand videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  duration: integer("duration"),
  thumbnailUrl: text("thumbnail_url"),
  discussionGuide: text("discussion_guide").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
});

// Discussion recordings table
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  videoId: integer("video_id"),
  liveEventId: integer("live_event_id"),
  date: timestamp("date").defaultNow().notNull(),
  participants: integer("participants").default(0),
  duration: integer("duration").default(0),
  transcription: text("transcription").notNull(),
  audioUrl: text("audio_url"),
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLiveEvent = z.infer<typeof insertLiveEventSchema>;
export type LiveEvent = typeof liveEvents.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussions.$inferSelect;
