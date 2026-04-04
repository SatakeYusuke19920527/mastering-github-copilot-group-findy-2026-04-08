// 通知対象ロール
export type NotificationTargetRole = "all" | "parent" | "admin";

// Cosmos DB partition key: targetRole
export interface Notification {
  id: string;
  title: string;
  body: string;
  targetRole: NotificationTargetRole;
  publishedAt: string; // ISO date
  expiresAt?: string; // ISO date
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationCreateInput = Omit<Notification, "id" | "createdAt" | "updatedAt">;
export type NotificationUpdateInput = Partial<NotificationCreateInput>;
