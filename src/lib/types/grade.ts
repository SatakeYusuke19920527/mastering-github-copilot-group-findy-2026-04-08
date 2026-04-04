// 試験種別
export type ExamType = "regular" | "mock" | "entrance" | "quiz";

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  regular: "定期テスト",
  mock: "模試",
  entrance: "入試",
  quiz: "小テスト",
};

export const SUBJECTS = ["国語", "数学", "英語", "理科", "社会"] as const;

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  examType: ExamType;
  examName: string;
  date: string; // ISO date
  subject: string;
  score: number;
  maxScore: number;
  rank?: number;
  totalStudents?: number;
  createdAt: string;
  updatedAt: string;
}

// Cosmos DB partition key: studentId
export type ExamResultCreateInput = Omit<ExamResult, "id" | "createdAt" | "updatedAt">;
export type ExamResultUpdateInput = Partial<ExamResultCreateInput>;
