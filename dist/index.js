// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var liveEvents = pgTable("live_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  eventDate: timestamp("event_date").notNull(),
  discussionGuide: text("discussion_guide").notNull()
});
var insertLiveEventSchema = createInsertSchema(liveEvents).omit({
  id: true
});
var videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  duration: integer("duration"),
  thumbnailUrl: text("thumbnail_url"),
  discussionGuide: text("discussion_guide").notNull(),
  active: boolean("active").default(true).notNull()
});
var insertVideoSchema = createInsertSchema(videos).omit({
  id: true
});
var discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  videoId: integer("video_id"),
  liveEventId: integer("live_event_id"),
  date: timestamp("date").defaultNow().notNull(),
  participants: integer("participants").default(0),
  duration: integer("duration").default(0),
  transcription: text("transcription").notNull(),
  audioUrl: text("audio_url")
});
var insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true
});

// server/database-storage.ts
import session from "express-session";
import connectPg from "connect-pg-simple";

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var connectionString = process.env.DATABASE_URL;
var client = postgres(connectionString);
var db = drizzle(client);

// server/database-storage.ts
import { eq, desc } from "drizzle-orm";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Video methods
  async getAllVideos() {
    return await db.select().from(videos);
  }
  async getActiveVideos() {
    return await db.select().from(videos).where(eq(videos.active, true));
  }
  async getVideo(id) {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }
  async createVideo(insertVideo) {
    const [video] = await db.insert(videos).values({
      ...insertVideo,
      duration: insertVideo.duration ?? null,
      thumbnailUrl: insertVideo.thumbnailUrl ?? null,
      active: insertVideo.active ?? true
    }).returning();
    return video;
  }
  async updateVideo(id, updateData) {
    const [updatedVideo] = await db.update(videos).set(updateData).where(eq(videos.id, id)).returning();
    return updatedVideo;
  }
  async deleteVideo(id) {
    const [deletedVideo] = await db.delete(videos).where(eq(videos.id, id)).returning();
    return !!deletedVideo;
  }
  // Live event methods
  async getLiveEvent() {
    const [event] = await db.select().from(liveEvents).orderBy(desc(liveEvents.eventDate)).limit(1);
    return event;
  }
  async createLiveEvent(insertLiveEvent) {
    const [liveEvent] = await db.insert(liveEvents).values(insertLiveEvent).returning();
    return liveEvent;
  }
  async updateLiveEvent(id, updateData) {
    const [updatedLiveEvent] = await db.update(liveEvents).set(updateData).where(eq(liveEvents.id, id)).returning();
    return updatedLiveEvent;
  }
  // Discussion methods
  async getAllDiscussions() {
    return await db.select().from(discussions);
  }
  async getDiscussion(id) {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }
  async getDiscussionsByVideo(videoId) {
    return await db.select().from(discussions).where(eq(discussions.videoId, videoId));
  }
  async getDiscussionsByLiveEvent(liveEventId) {
    return await db.select().from(discussions).where(eq(discussions.liveEventId, liveEventId));
  }
  async createDiscussion(insertDiscussion) {
    const [discussion] = await db.insert(discussions).values({
      ...insertDiscussion,
      date: insertDiscussion.date ?? /* @__PURE__ */ new Date(),
      duration: insertDiscussion.duration ?? null,
      videoId: insertDiscussion.videoId ?? null,
      liveEventId: insertDiscussion.liveEventId ?? null,
      participants: insertDiscussion.participants ?? null,
      audioUrl: insertDiscussion.audioUrl ?? null
    }).returning();
    return discussion;
  }
  async deleteDiscussion(id) {
    const [deletedDiscussion] = await db.delete(discussions).where(eq(discussions.id, id)).returning();
    return !!deletedDiscussion;
  }
  // Seed database with initial data
  async seedDatabase() {
    const videoCount = await db.select().from(videos);
    if (videoCount.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    console.log("Seeding database with initial data...");
    const [admin] = await db.insert(users).values({
      username: "admin",
      password: "$2b$10$1XpzUYu8FuvuaBb3rkTGTeCwsYJ6K1.aPuFPbSWhZ5iXNCVIwZ1RW",
      // "admin"
      displayName: "Administrator",
      isAdmin: true
    }).returning();
    await this.createLiveEvent({
      title: "Metropolitan Museum Virtual Tour: Renaissance Art",
      description: "Join curator Dr. Eleanor Richards for a virtual tour of the Renaissance collection at the Metropolitan Museum of Art. Discover the stories behind masterpieces from Leonardo, Raphael, and Michelangelo.",
      youtubeUrl: "Z1XU5ZGqzeI",
      // User-provided YouTube video ID
      eventDate: /* @__PURE__ */ new Date("2023-12-31T15:00:00"),
      // Thursday at 3:00 PM
      discussionGuide: "# Background\nThe Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages. Join Dr. Eleanor Richards as she explores the MET's collection.\n\n# Discussion Questions\n1. What artwork resonated with you the most and why?\n2. How do these Renaissance works reflect the cultural values of their time?\n3. Can you identify techniques that were revolutionary for this period?\n4. How do these works compare to modern art?"
    });
    const videosToCreate = [
      {
        title: "British Museum Virtual Tour: Ancient Greece",
        description: "Journey through the British Museum collection of Ancient Greek artifacts and sculptures with Dr. Marcus Anderson.",
        youtubeUrl: "s5lsyGF7Us0",
        // User-provided YouTube video ID
        duration: 45,
        thumbnailUrl: "",
        discussionGuide: "# Background\nAncient Greece laid the foundation for Western civilization, with numerous contributions to philosophy, literature, mathematics, science, and art.\n\n# Discussion Questions\n1. What surprised you the most about Ancient Greek artifacts?\n2. How do these artifacts reflect the values and beliefs of Ancient Greek society?\n3. What parallels can you draw between Ancient Greek society and our modern world?\n4. Which artifact or story did you find most compelling and why?",
        active: true
      },
      {
        title: "National Gallery: Masterpieces of Impressionism",
        description: "Explore the vibrant colors and revolutionary techniques of the Impressionist movement with curator Dr. Sarah Collins.",
        youtubeUrl: "jWE6cIqIbGU",
        // User-provided YouTube video ID
        duration: 68,
        thumbnailUrl: "",
        discussionGuide: "# Background\nImpressionism began in the 1860s in Paris and represented a radical break from traditional European painting, characterized by visible brushstrokes, open composition, and emphasis on light.\n\n# Discussion Questions\n1. Which Impressionist painting stood out to you and why?\n2. How did Impressionism challenge conventional art at the time?\n3. What emotions do these paintings evoke?\n4. How has Impressionism influenced modern art and culture?\n5. If you could own one Impressionist painting, which would it be?",
        active: true
      },
      {
        title: "The 1950s: A Decade That Defined America",
        description: "Explore the cultural revolution, innovation, and everyday life in post-war America.",
        youtubeUrl: "eDtM6OroGo4",
        // This is a placeholder - would be replaced with actual URL
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
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "harker-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/audio.ts
import { Readable } from "stream";
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key" });
async function transcribeAudio(audioBuffer) {
  try {
    const stream = new Readable();
    stream.push(audioBuffer);
    stream.push(null);
    const fileObj = {
      name: `recording-${Date.now()}.webm`,
      data: stream,
      type: "audio/webm"
    };
    const transcription = await openai.audio.transcriptions.create({
      file: fileObj,
      model: "whisper-1",
      response_format: "text",
      language: "en"
    });
    return transcription.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// server/routes.ts
import { z } from "zod";
var isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};
var isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
async function registerRoutes(app2) {
  setupAuth(app2);
  const httpServer = createServer(app2);
  app2.get("/api/videos", async (req, res) => {
    try {
      const videos2 = await storage.getActiveVideos();
      res.json(videos2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  app2.get("/api/videos/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });
  app2.post("/api/videos", isAdmin, async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create video" });
    }
  });
  app2.put("/api/videos/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertVideoSchema.partial().parse(req.body);
      const updatedVideo = await storage.updateVideo(id, validatedData);
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(updatedVideo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update video" });
    }
  });
  app2.delete("/api/videos/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteVideo(id);
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  });
  app2.get("/api/live-events", async (req, res) => {
    try {
      const liveEvent = await storage.getLiveEvent();
      if (!liveEvent) {
        return res.status(404).json({ message: "No live event found" });
      }
      res.json(liveEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live event" });
    }
  });
  app2.post("/api/live-events", isAdmin, async (req, res) => {
    try {
      const validatedData = insertLiveEventSchema.parse(req.body);
      const liveEvent = await storage.createLiveEvent(validatedData);
      res.status(201).json(liveEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid live event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create live event" });
    }
  });
  app2.put("/api/live-events/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertLiveEventSchema.partial().parse(req.body);
      const updatedLiveEvent = await storage.updateLiveEvent(id, validatedData);
      if (!updatedLiveEvent) {
        return res.status(404).json({ message: "Live event not found" });
      }
      res.json(updatedLiveEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid live event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update live event" });
    }
  });
  app2.get("/api/discussions", async (req, res) => {
    try {
      const discussions2 = await storage.getAllDiscussions();
      res.json(discussions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  app2.get("/api/discussions/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const discussion = await storage.getDiscussion(id);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussion" });
    }
  });
  app2.get("/api/videos/:id/discussions", async (req, res) => {
    try {
      const videoId = Number(req.params.id);
      const discussions2 = await storage.getDiscussionsByVideo(videoId);
      res.json(discussions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  app2.get("/api/live-events/:id/discussions", async (req, res) => {
    try {
      const liveEventId = Number(req.params.id);
      const discussions2 = await storage.getDiscussionsByLiveEvent(liveEventId);
      res.json(discussions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  app2.post("/api/discussions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDiscussionSchema.parse(req.body);
      const discussion = await storage.createDiscussion(validatedData);
      res.status(201).json(discussion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid discussion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });
  app2.delete("/api/discussions/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteDiscussion(id);
      if (!success) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete discussion" });
    }
  });
  app2.post("/api/transcribe", isAuthenticated, async (req, res) => {
    try {
      if (!req.body || !req.body.audio) {
        return res.status(400).json({ message: "Audio data is required" });
      }
      const base64Data = req.body.audio.split(",")[1];
      const audioBuffer = Buffer.from(base64Data, "base64");
      const transcription = await transcribeAudio(audioBuffer);
      res.json({ transcription });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await storage.seedDatabase();
    log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
