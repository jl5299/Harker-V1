import "dotenv/config";

// Debug logging
console.log("Loading environment variables...");
console.log("Current working directory:", process.cwd());
console.log("Environment variables:");
console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "present" : "missing");
console.log("- SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY ? "present" : "missing");
console.log("- PORT:", process.env.PORT || "3001 (default)");
console.log("- NODE_ENV:", process.env.NODE_ENV || "development (default)");

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error("Error: SUPABASE_URL is missing");
  throw new Error("Missing required environment variable: SUPABASE_URL");
}

if (!supabaseServiceKey) {
  console.error("Error: SUPABASE_SERVICE_KEY is missing");
  throw new Error("Missing required environment variable: SUPABASE_SERVICE_KEY");
}

export const config = {
  supabaseUrl,
  supabaseServiceKey,
  port: process.env.PORT || 3001
}; 