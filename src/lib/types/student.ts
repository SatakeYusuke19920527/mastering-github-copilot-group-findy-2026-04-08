// 生徒の在籍状態
export type EnrollmentStatus = "enrolled" | "withdrawn" | "suspended";

// 学年
export type GradeLevel =
  | "elementary-1" | "elementary-2" | "elementary-3"
  | "elementary-4" | "elementary-5" | "elementary-6"
  | "junior-1" | "junior-2" | "junior-3"
  | "high-1" | "high-2" | "high-3"
  | "adult";

export const GRADE_LABELS: Record<GradeLevel, string> = {
  "elementary-1": "小1", "elementary-2": "小2", "elementary-3": "小3",
  "elementary-4": "小4", "elementary-5": "小5", "elementary-6": "小6",
  "junior-1": "中1", "junior-2": "中2", "junior-3": "中3",
  "high-1": "高1", "high-2": "高2", "high-3": "高3",
  "adult": "社会人",
};

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  enrolled: "在籍中",
  withdrawn: "退塾",
  suspended: "休塾中",
};

export interface ParentInfo {
  name: string;
  phone: string;
  email: string;
  clerkUserId?: string;
}

export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  gradeLevel: GradeLevel;
  school: string;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;    // ISO date
  withdrawnAt?: string;  // ISO date
  parent: ParentInfo;
  subjects: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Cosmos DB partition key: gradeLevel
export type StudentCreateInput = Omit<Student, "id" | "createdAt" | "updatedAt">;
export type StudentUpdateInput = Partial<StudentCreateInput>;
