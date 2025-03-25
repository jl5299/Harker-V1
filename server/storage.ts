import { users, type User, type InsertUser, videos, type Video, type InsertVideo, liveEvents, type LiveEvent, type InsertLiveEvent, discussions, type Discussion, type InsertDiscussion } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private liveEvents: Map<number, LiveEvent>;
  private discussions: Map<number, Discussion>;
  private currentUserId: number;
  private currentVideoId: number;
  private currentLiveEventId: number;
  private currentDiscussionId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.liveEvents = new Map();
    this.discussions = new Map();
    
    this.currentUserId = 1;
    this.currentVideoId = 1;
    this.currentLiveEventId = 1;
    this.currentDiscussionId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123", // will be hashed in the auth.ts
    }).then(user => {
      // Update admin status
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });
    
    // Seed with sample live event
    this.createLiveEvent({
      title: "Metropolitan Museum Virtual Tour: Renaissance Art",
      description: "Join curator Dr. Eleanor Richards for a virtual tour of the Renaissance collection at the Metropolitan Museum of Art. Discover the stories behind masterpieces from Leonardo, Raphael, and Michelangelo.",
      youtubeUrl: "Z1XU5ZGqzeI", // User-provided YouTube video ID
      eventDate: new Date("2023-12-31T15:00:00"), // Thursday at 3:00 PM
      discussionGuide: "# Background\nThe Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages. Join Dr. Eleanor Richards as she explores the MET's collection.\n\n# Discussion Questions\n1. What artwork resonated with you the most and why?\n2. How do these Renaissance works reflect the cultural values of their time?\n3. Can you identify techniques that were revolutionary for this period?\n4. How do these works compare to modern art?"
    });
    
    // Seed with sample videos
    const videos = [
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
        thumbnailUrl: "https://i.ytimg.com/vi/eDtM6OroGo4/maxresdefault.jpg",
        discussionGuide: "# Background\nThe 1950s saw America's transformation into a cultural and economic superpower following WWII. This documentary explores daily life, innovation, and cultural shifts.\n\n# Discussion Questions\n1. If you lived through the 1950s, how accurately does this documentary reflect your experiences?\n2. What aspects of 1950s America have been maintained in today's society?\n3. Which innovations from this decade had the biggest impact on American life?\n4. How did entertainment and media change during this period?\n5. What societal challenges were present but perhaps not highlighted in popular culture of the time?\n\n# Key Concepts\n- **Baby Boom**: The notable increase in birth rate following WWII.\n- **Suburban Expansion**: The growth of residential communities outside city centers.\n- **Consumer Culture**: The emphasis on buying goods as a way of life and identity."
      }
    ];
    
    for (const video of videos) {
      this.createVideo(video);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // Video methods
  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getActiveVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => video.active);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const video: Video = { ...insertVideo, id };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: number, updateData: Partial<InsertVideo>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo: Video = { ...video, ...updateData };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }

  // Live event methods
  async getLiveEvent(): Promise<LiveEvent | undefined> {
    // Return the most recent live event
    const events = Array.from(this.liveEvents.values());
    if (events.length === 0) return undefined;
    
    // Sort by date (newest first)
    events.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
    return events[0];
  }

  async getLiveEventById(id: number): Promise<LiveEvent | undefined> {
    return this.liveEvents.get(id);
  }

  async createLiveEvent(insertLiveEvent: InsertLiveEvent): Promise<LiveEvent> {
    const id = this.currentLiveEventId++;
    const liveEvent: LiveEvent = { ...insertLiveEvent, id };
    this.liveEvents.set(id, liveEvent);
    return liveEvent;
  }

  async updateLiveEvent(id: number, updateData: Partial<InsertLiveEvent>): Promise<LiveEvent | undefined> {
    const liveEvent = this.liveEvents.get(id);
    if (!liveEvent) return undefined;
    
    const updatedLiveEvent: LiveEvent = { ...liveEvent, ...updateData };
    this.liveEvents.set(id, updatedLiveEvent);
    return updatedLiveEvent;
  }

  // Discussion methods
  async getAllDiscussions(): Promise<Discussion[]> {
    return Array.from(this.discussions.values());
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    return this.discussions.get(id);
  }

  async getDiscussionsByVideo(videoId: number): Promise<Discussion[]> {
    return Array.from(this.discussions.values())
      .filter(discussion => discussion.videoId === videoId);
  }

  async getDiscussionsByLiveEvent(liveEventId: number): Promise<Discussion[]> {
    return Array.from(this.discussions.values())
      .filter(discussion => discussion.liveEventId === liveEventId);
  }

  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const id = this.currentDiscussionId++;
    const discussion: Discussion = { ...insertDiscussion, id };
    this.discussions.set(id, discussion);
    return discussion;
  }

  async deleteDiscussion(id: number): Promise<boolean> {
    return this.discussions.delete(id);
  }
}

export const storage = new MemStorage();
