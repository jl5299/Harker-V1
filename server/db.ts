import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create a PostgreSQL client
const connectionString = process.env.DATABASE_URL as string;
const client = postgres(connectionString);

// Create a Drizzle ORM instance
export const db = drizzle(client);