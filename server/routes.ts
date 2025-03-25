import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { setupAuth } from "./auth";
import { transcribeAudio } from "./audio";
import { z } from "zod";
import { insertDiscussionSchema, insertLiveEventSchema, insertVideoSchema } from "@shared/schema";

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Video routes
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getActiveVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  
  app.get("/api/videos/:id", async (req, res) => {
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
  
  app.post("/api/videos", isAdmin, async (req, res) => {
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
  
  app.put("/api/videos/:id", isAdmin, async (req, res) => {
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
  
  app.delete("/api/videos/:id", isAdmin, async (req, res) => {
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
  
  // Live Events routes
  app.get("/api/live-events", async (req, res) => {
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
  
  app.post("/api/live-events", isAdmin, async (req, res) => {
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
  
  app.put("/api/live-events/:id", isAdmin, async (req, res) => {
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
  
  // Discussion routes
  app.get("/api/discussions", async (req, res) => {
    try {
      const discussions = await storage.getAllDiscussions();
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  
  app.get("/api/discussions/:id", async (req, res) => {
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
  
  app.get("/api/videos/:id/discussions", async (req, res) => {
    try {
      const videoId = Number(req.params.id);
      const discussions = await storage.getDiscussionsByVideo(videoId);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  
  app.get("/api/live-events/:id/discussions", async (req, res) => {
    try {
      const liveEventId = Number(req.params.id);
      const discussions = await storage.getDiscussionsByLiveEvent(liveEventId);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  
  app.post("/api/discussions", isAuthenticated, async (req, res) => {
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
  
  app.delete("/api/discussions/:id", isAdmin, async (req, res) => {
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
  
  // Transcription endpoint
  app.post("/api/transcribe", isAuthenticated, async (req, res) => {
    try {
      if (!req.body || !req.body.audio) {
        return res.status(400).json({ message: "Audio data is required" });
      }
      
      // Extract audio data from base64 string
      const base64Data = req.body.audio.split(',')[1];
      const audioBuffer = Buffer.from(base64Data, 'base64');
      
      // Transcribe audio
      const transcription = await transcribeAudio(audioBuffer);
      
      res.json({ transcription });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });
  
  return httpServer;
}
