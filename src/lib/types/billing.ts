// 請求ステータス
export type BillingStatus = "pending" | "paid" | "overdue" | "cancelled";

// 請求種別
export type BillingType =
  | "monthly"
  | "spring-course"
  | "summer-course"
  | "winter-course"
  | "material"
  | "other";

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  monthly: "月謝",
  "spring-course": "春期講習",
  "summer-course": "夏期講習",
  "winter-course": "冬期講習",
  material: "教材費",
  other: "その他",
};

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  pending: "未入金",
  paid: "入金済",
  overdue: "滞納",
  cancelled: "取消",
};

export interface BillingRecord {
  id: string;
  studentId: string;
  studentName: string;
  billingType: BillingType;
  description: string;
  amount: number;
  billingMonth: string; // YYYY-MM
  status: BillingStatus;
  dueDate: string; // ISO date
  paidAt?: string; // ISO date
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Cosmos DB partition key: studentId
export type BillingCreateInput = Omit<BillingRecord, "id" | "createdAt" | "updatedAt">;
export type BillingUpdateInput = Partial<BillingCreateInput>;
