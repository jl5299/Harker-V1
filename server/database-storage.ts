import { users, type User, type InsertUser, videos, type Video, type InsertVideo, liveEvents, type LiveEvent, type InsertLiveEvent, discussions, type Discussion, type InsertDiscussion, reminders, type Reminder, type InsertReminder, discussionGuideAnswers, type DiscussionGuideAnswer, type InsertDiscussionGuideAnswer, userActivities, type UserActivity, type InsertUserActivity } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { hashPassword } from "./auth";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video methods
  getAllVideos(): Promise<Video[]>;
  getActiveVideos(): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Live event methods
  getLiveEvent(): Promise<LiveEvent | undefined>;
  getLiveEventById(id: number): Promise<LiveEvent | undefined>;
  createLiveEvent(liveEvent: InsertLiveEvent): Promise<LiveEvent>;
  updateLiveEvent(id: number, liveEvent: Partial<InsertLiveEvent>): Promise<LiveEvent | undefined>;
  
  // Discussion methods
  getAllDiscussions(): Promise<Discussion[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  getDiscussionsByVideo(videoId: number): Promise<Discussion[]>;
  getDiscussionsByLiveEvent(liveEventId: number): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  deleteDiscussion(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
  
  // Initialize database with seed data
  seedDatabase(): Promise<void>;
  
  // Reminder methods
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getRemindersByUser(userId: number): Promise<Reminder[]>;
  getRemindersByEvent(eventId: number, eventType: string): Promise<Reminder[]>;
  deleteReminder(id: number): Promise<boolean>;
  
  // Discussion guide answer methods
  createDiscussionGuideAnswer(answer: InsertDiscussionGuideAnswer): Promise<DiscussionGuideAnswer>;
  getDiscussionGuideAnswersByUser(userId: number): Promise<DiscussionGuideAnswer[]>;
  getDiscussionGuideAnswersByEvent(eventId: number, eventType: string): Promise<DiscussionGuideAnswer[]>;
  updateDiscussionGuideAnswer(id: number, answers: Record<string, string>): Promise<DiscussionGuideAnswer | undefined>;
  deleteDiscussionGuideAnswer(id: number): Promise<boolean>;

  // User activity methods
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivities(userId: number): Promise<UserActivity[]>;
  getEventParticipants(eventId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Set up PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Video methods
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async getActiveVideos(): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.active, true));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values({
      ...insertVideo,
      duration: insertVideo.duration ?? null,
      thumbnailUrl: insertVideo.thumbnailUrl ?? null,
      active: insertVideo.active ?? true
    }).returning();
    return video;
  }

  async updateVideo(id: number, updateData: Partial<InsertVideo>): Promise<Video | undefined> {
    const [updatedVideo] = await db.update(videos)
      .set(updateData)
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const [deletedVideo] = await db.delete(videos)
      .where(eq(videos.id, id))
      .returning();
    return !!deletedVideo;
  }

  // Live event methods
  async getLiveEvent(): Promise<LiveEvent | undefined> {
    const [event] = await db.select()
      .from(liveEvents)
      .orderBy(desc(liveEvents.eventDate))
      .limit(1);
    return event;
  }

  async getLiveEventById(id: number): Promise<LiveEvent | undefined> {
    const [event] = await db.select()
      .from(liveEvents)
      .where(eq(liveEvents.id, id));
    return event;
  }

  async createLiveEvent(insertLiveEvent: InsertLiveEvent): Promise<LiveEvent> {
    const [liveEvent] = await db.insert(liveEvents)
      .values(insertLiveEvent)
      .returning();
    return liveEvent;
  }

  async updateLiveEvent(id: number, updateData: Partial<InsertLiveEvent>): Promise<LiveEvent | undefined> {
    const [updatedLiveEvent] = await db.update(liveEvents)
      .set(updateData)
      .where(eq(liveEvents.id, id))
      .returning();
    return updatedLiveEvent;
  }

  // Discussion methods
  async getAllDiscussions(): Promise<Discussion[]> {
    return await db.select().from(discussions);
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }

  async getDiscussionsByVideo(videoId: number): Promise<Discussion[]> {
    return await db.select()
      .from(discussions)
      .where(eq(discussions.videoId, videoId));
  }

  async getDiscussionsByLiveEvent(liveEventId: number): Promise<Discussion[]> {
    return await db.select()
      .from(discussions)
      .where(eq(discussions.liveEventId, liveEventId));
  }

  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const [discussion] = await db.insert(discussions)
      .values({
        ...insertDiscussion,
        date: insertDiscussion.date ?? new Date(),
        duration: insertDiscussion.duration ?? null,
        videoId: insertDiscussion.videoId ?? null,
        liveEventId: insertDiscussion.liveEventId ?? null,
        participants: insertDiscussion.participants ?? null,
        audioUrl: insertDiscussion.audioUrl ?? null
      })
      .returning();
    return discussion;
  }

  async deleteDiscussion(id: number): Promise<boolean> {
    const [deletedDiscussion] = await db.delete(discussions)
      .where(eq(discussions.id, id))
      .returning();
    return !!deletedDiscussion;
  }

  // Seed database with initial data
  async seedDatabase(): Promise<void> {
    // Check if database is already seeded
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Create test user
    const testUser = await this.createUser({
      username: "testuser",
      password: await hashPassword("password123"),
    });

    // Create test videos
    const videos = [
      {
        title: "British Museum Virtual Tour: A Journey Through Time",
        description: "Explore the British Museum's vast collection of artifacts from ancient civilizations.",
        youtubeUrl: "https://www.youtube.com/embed/8qXqJqXqJqX",
        duration: 45,
        thumbnailUrl: "https://i.ytimg.com/vi/8qXqJqXqJqX/maxresdefault.jpg",
        discussionGuide: "# Background\nThe British Museum houses one of the world's most comprehensive collections of human history and culture.\n\n# Discussion Questions\n1. Which artifacts from the tour caught your attention the most?\n2. How do these ancient artifacts help us understand human history?\n3. What similarities do you see between ancient civilizations and modern society?\n4. How has technology changed the way we can experience museums?\n5. What role do museums play in preserving cultural heritage?\n\n# Key Concepts\n- **Cultural Heritage**: The legacy of physical artifacts and intangible attributes of a group or society.\n- **Archaeology**: The study of human history through excavation and analysis of artifacts.\n- **Conservation**: The protection and preservation of cultural and natural heritage.",
        active: true,
      },
      // ... other videos ...
    ];

    for (const video of videos) {
      await this.createVideo(video);
    }

    // Create test live event
    const liveEvent = await this.createLiveEvent({
      title: "Metropolitan Museum Virtual Tour",
      description: "Join us for a virtual tour of the Metropolitan Museum of Art's most iconic exhibits.",
      youtubeUrl: "https://www.youtube.com/embed/abc123",
      eventDate: new Date("2024-03-26T15:00:00Z"),
      discussionGuide: "# Background\nThe Metropolitan Museum of Art is one of the world's largest and finest art museums.\n\n# Discussion Questions\n1. Which artworks from the tour resonated with you the most?\n2. How does art reflect the time period in which it was created?\n3. What role do museums play in making art accessible to everyone?\n4. How has technology changed the way we experience art?\n5. What can we learn about different cultures through their art?\n\n# Key Concepts\n- **Art History**: The study of art objects and their development throughout history.\n- **Cultural Expression**: How different societies express their values and beliefs through art.\n- **Museum Education**: The role of museums in teaching and preserving cultural knowledge.",
    });

    // Add test activity for British Museum Virtual Tour
    await this.createUserActivity({
      userId: testUser.id,
      eventId: 1, // British Museum video ID
      eventType: 'video',
      activityType: 'reminder'
    });

    console.log("Database seeded successfully");
  }

  // Reminder methods
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db.insert(reminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async getRemindersByUser(userId: number): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .where(eq(reminders.userId, userId));
  }

  async getRemindersByEvent(eventId: number, eventType: string): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .where(
        and(
          eq(reminders.eventId, eventId),
          eq(reminders.eventType, eventType)
        )
      );
  }

  async deleteReminder(id: number): Promise<boolean> {
    const [deletedReminder] = await db.delete(reminders)
      .where(eq(reminders.id, id))
      .returning();
    return !!deletedReminder;
  }

  // Discussion guide answer methods
  async createDiscussionGuideAnswer(insertAnswer: InsertDiscussionGuideAnswer): Promise<DiscussionGuideAnswer> {
    const [answer] = await db.insert(discussionGuideAnswers)
      .values(insertAnswer)
      .returning();
    return answer;
  }

  async getDiscussionGuideAnswersByUser(userId: number): Promise<DiscussionGuideAnswer[]> {
    return await db.select()
      .from(discussionGuideAnswers)
      .where(eq(discussionGuideAnswers.userId, userId));
  }

  async getDiscussionGuideAnswersByEvent(eventId: number, eventType: string): Promise<DiscussionGuideAnswer[]> {
    return await db.select()
      .from(discussionGuideAnswers)
      .where(
        and(
          eq(discussionGuideAnswers.eventId, eventId),
          eq(discussionGuideAnswers.eventType, eventType)
        )
      );
  }

  async updateDiscussionGuideAnswer(id: number, answers: Record<string, string>): Promise<DiscussionGuideAnswer | undefined> {
    const [updatedAnswer] = await db.update(discussionGuideAnswers)
      .set({
        answers,
        updatedAt: new Date()
      })
      .where(eq(discussionGuideAnswers.id, id))
      .returning();
    return updatedAnswer;
  }

  async deleteDiscussionGuideAnswer(id: number): Promise<boolean> {
    const [deletedAnswer] = await db.delete(discussionGuideAnswers)
      .where(eq(discussionGuideAnswers.id, id))
      .returning();
    return !!deletedAnswer;
  }

  // User activity methods
  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db.insert(userActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return await db.select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt));
  }

  async getEventParticipants(eventId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(userActivities)
      .where(
        and(
          eq(userActivities.eventId, eventId),
          eq(userActivities.activityType, 'rsvp')
        )
      );
    return result[0].count;
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();