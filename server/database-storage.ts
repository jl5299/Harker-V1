import { users, type User, type InsertUser, videos, type Video, type InsertVideo, liveEvents, type LiveEvent, type InsertLiveEvent, discussions, type Discussion, type InsertDiscussion } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
    // Check if there's any data already
    const videoCount = await db.select().from(videos);
    if (videoCount.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    console.log("Seeding database with initial data...");
    
    // Seed admin user
    const [admin] = await db.insert(users)
      .values({
        username: "admin",
        password: "$2b$10$1XpzUYu8FuvuaBb3rkTGTeCwsYJ6K1.aPuFPbSWhZ5iXNCVIwZ1RW", // "admin"
        displayName: "Administrator",
        isAdmin: true
      })
      .returning();
      
    // Seed with sample live event
    await this.createLiveEvent({
      title: "Metropolitan Museum Virtual Tour: Renaissance Art",
      description: "Join curator Dr. Eleanor Richards for a virtual tour of the Renaissance collection at the Metropolitan Museum of Art. Discover the stories behind masterpieces from Leonardo, Raphael, and Michelangelo.",
      youtubeUrl: "Z1XU5ZGqzeI", // User-provided YouTube video ID
      eventDate: new Date("2023-12-31T15:00:00"), // Thursday at 3:00 PM
      discussionGuide: "# Background\nThe Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages. Join Dr. Eleanor Richards as she explores the MET's collection.\n\n# Discussion Questions\n1. What artwork resonated with you the most and why?\n2. How do these Renaissance works reflect the cultural values of their time?\n3. Can you identify techniques that were revolutionary for this period?\n4. How do these works compare to modern art?"
    });
    
    // Seed with sample videos
    const videosToCreate = [
      {
        title: "British Museum Virtual Tour: Ancient Greece",
        description: "Journey through the British Museum collection of Ancient Greek artifacts and sculptures with Dr. Marcus Anderson.",
        youtubeUrl: "s5lsyGF7Us0", // User-provided YouTube video ID
        duration: 45,
        thumbnailUrl: "",
        discussionGuide: "# Background\nAncient Greece laid the foundation for Western civilization, with numerous contributions to philosophy, literature, mathematics, science, and art.\n\n# Discussion Questions\n1. What surprised you the most about Ancient Greek artifacts?\n2. How do these artifacts reflect the values and beliefs of Ancient Greek society?\n3. What parallels can you draw between Ancient Greek society and our modern world?\n4. Which artifact or story did you find most compelling and why?",
        active: true
      },
      {
        title: "National Gallery: Masterpieces of Impressionism",
        description: "Explore the vibrant colors and revolutionary techniques of the Impressionist movement with curator Dr. Sarah Collins.",
        youtubeUrl: "jWE6cIqIbGU", // User-provided YouTube video ID
        duration: 68,
        thumbnailUrl: "",
        discussionGuide: "# Background\nImpressionism began in the 1860s in Paris and represented a radical break from traditional European painting, characterized by visible brushstrokes, open composition, and emphasis on light.\n\n# Discussion Questions\n1. Which Impressionist painting stood out to you and why?\n2. How did Impressionism challenge conventional art at the time?\n3. What emotions do these paintings evoke?\n4. How has Impressionism influenced modern art and culture?\n5. If you could own one Impressionist painting, which would it be?",
        active: true
      },
      {
        title: "The 1950s: A Decade That Defined America",
        description: "Explore the cultural revolution, innovation, and everyday life in post-war America.",
        youtubeUrl: "eDtM6OroGo4", // This is a placeholder - would be replaced with actual URL
        duration: 55,
        thumbnailUrl: "",
        discussionGuide: "# Background\nThe 1950s saw America's transformation into a cultural and economic superpower following WWII. This documentary explores daily life, innovation, and cultural shifts.\n\n# Discussion Questions\n1. If you lived through the 1950s, how accurately does this documentary reflect your experiences?\n2. What aspects of 1950s America have been maintained in today's society?\n3. Which innovations from this decade had the biggest impact on American life?\n4. How did entertainment and media change during this period?\n5. What societal challenges were present but perhaps not highlighted in popular culture of the time?\n\n# Key Concepts\n- **Baby Boom**: The notable increase in birth rate following WWII.\n- **Suburban Expansion**: The growth of residential communities outside city centers.\n- **Consumer Culture**: The emphasis on buying goods as a way of life and identity.",
        active: true
      }
    ];
    
    for (const videoData of videosToCreate) {
      await this.createVideo(videoData);
    }
    
    console.log("Database seeding completed successfully!");
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();