// 欠席ステータス（カンバンボードの3列に対応）
export type AbsenceStatus = "reported" | "rescheduled" | "completed" | "cancelled";

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  reported: "欠席一覧",
  rescheduled: "振替実施予定",
  completed: "振替実施済み",
  cancelled: "取消",
};

// 報告者区分
export type AbsenceReportedBy = "parent" | "staff";

export const REPORTED_BY_LABELS: Record<AbsenceReportedBy, string> = {
  parent: "保護者",
  staff: "スタッフ",
};

// Cosmos DB partition key: studentId
export interface AbsenceRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  originalDate: string; // ISO date
  originalScheduleId?: string;
  schedulePeriod?: string; // e.g. "4時間目"
  subject: string;
  reason: string;
  status: AbsenceStatus;
  rescheduledDate?: string; // ISO date
  rescheduledScheduleId?: string;
  reportedBy: AbsenceReportedBy;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AbsenceCreateInput = Omit<AbsenceRecord, "id" | "createdAt" | "updatedAt">;
export type AbsenceUpdateInput = Partial<AbsenceCreateInput>;
