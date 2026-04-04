import { CosmosClient, Database } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DATABASE || "satake-juku";

let client: CosmosClient | null = null;
let database: Database | null = null;

export function getCosmosClient(): CosmosClient {
  if (!client) {
    client = new CosmosClient({ endpoint, key });
  }
  return client;
}

export function getDatabase(): Database {
  if (!database) {
    database = getCosmosClient().database(databaseId);
  }
  return database;
}

export function getContainer(containerId: string) {
  return getDatabase().container(containerId);
}

// Container names used across the app
export const CONTAINERS = {
  STUDENTS: "students",
  GRADES: "grades",
  SCHEDULES: "schedules",
  BILLING: "billing",
  ABSENCES: "absences",
  NOTIFICATIONS: "notifications",
  SETTINGS: "settings",
} as const;
