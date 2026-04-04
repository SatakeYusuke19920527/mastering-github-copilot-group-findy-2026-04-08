import { v4 as uuidv4 } from "uuid";
import { getContainer, CONTAINERS } from "@/lib/cosmos";
import type {
  Notification,
  NotificationCreateInput,
  NotificationUpdateInput,
} from "@/lib/types";

const container = () => getContainer(CONTAINERS.NOTIFICATIONS);

export async function listNotifications(filters?: {
  targetRole?: string;
  isPublished?: boolean;
}): Promise<Notification[]> {
  const conditions: string[] = [];
  const parameters: { name: string; value: string | boolean }[] = [];

  if (filters?.targetRole) {
    conditions.push("c.targetRole = @targetRole");
    parameters.push({ name: "@targetRole", value: filters.targetRole });
  }
  if (filters?.isPublished !== undefined) {
    conditions.push("c.isPublished = @isPublished");
    parameters.push({ name: "@isPublished", value: filters.isPublished });
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM c ${where} ORDER BY c.publishedAt DESC`;

  const { resources } = await container().items
    .query({ query, parameters })
    .fetchAll();

  return resources as Notification[];
}

export async function getNotification(
  id: string,
  targetRole: string
): Promise<Notification | null> {
  try {
    const { resource } = await container().item(id, targetRole).read<Notification>();
    return resource ?? null;
  } catch {
    return null;
  }
}

export async function createNotification(
  input: NotificationCreateInput
): Promise<Notification> {
  const now = new Date().toISOString();
  const notification: Notification = {
    ...input,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { resource } = await container().items.create(notification);
  return resource as Notification;
}

export async function updateNotification(
  id: string,
  targetRole: string,
  input: NotificationUpdateInput
): Promise<Notification | null> {
  const existing = await getNotification(id, targetRole);
  if (!existing) return null;

  const updated: Notification = {
    ...existing,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container().item(id, targetRole).replace(updated);
  return resource as Notification;
}

export async function deleteNotification(
  id: string,
  targetRole: string
): Promise<boolean> {
  try {
    await container().item(id, targetRole).delete();
    return true;
  } catch {
    return false;
  }
}
