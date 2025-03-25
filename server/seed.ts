import { storage } from "./database-storage";

async function seed() {
  try {
    await storage.seedDatabase();
    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed(); 