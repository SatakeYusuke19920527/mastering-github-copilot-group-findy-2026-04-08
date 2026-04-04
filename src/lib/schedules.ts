import { v4 as uuidv4 } from "uuid";
import { getContainer, CONTAINERS } from "@/lib/cosmos";
import type {
  Schedule,
  ScheduleCreateInput,
  ScheduleUpdateInput,
} from "@/lib/types";

const container = () => getContainer(CONTAINERS.SCHEDULES);

export async function listSchedules(filters?: {
  dayOfWeek?: number;
  subject?: string;
}): Promise<Schedule[]> {
  const conditions: string[] = [];
  const parameters: { name: string; value: string | number }[] = [];

  if (filters?.dayOfWeek !== undefined) {
    conditions.push("c.dayOfWeek = @dayOfWeek");
    parameters.push({ name: "@dayOfWeek", value: filters.dayOfWeek });
  }
  if (filters?.subject) {
    conditions.push("c.subject = @subject");
    parameters.push({ name: "@subject", value: filters.subject });
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM c ${where} ORDER BY c.dayOfWeek, c.startTime`;

  const { resources } = await container().items
    .query({ query, parameters })
    .fetchAll();

  return resources as Schedule[];
}

export async function getSchedule(id: string, dayOfWeek: number): Promise<Schedule | null> {
  try {
    const { resource } = await container().item(id, dayOfWeek).read<Schedule>();
    return resource ?? null;
  } catch {
    return null;
  }
}

export async function createSchedule(input: ScheduleCreateInput): Promise<Schedule> {
  const now = new Date().toISOString();
  const schedule: Schedule = {
    ...input,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { resource } = await container().items.create(schedule);
  return resource as Schedule;
}

export async function updateSchedule(
  id: string,
  dayOfWeek: number,
  input: ScheduleUpdateInput
): Promise<Schedule | null> {
  const existing = await getSchedule(id, dayOfWeek);
  if (!existing) return null;

  const updated: Schedule = {
    ...existing,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container().item(id, dayOfWeek).replace(updated);
  return resource as Schedule;
}

export async function deleteSchedule(id: string, dayOfWeek: number): Promise<boolean> {
  try {
    await container().item(id, dayOfWeek).delete();
    return true;
  } catch {
    return false;
  }
}
