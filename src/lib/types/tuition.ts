import type { GradeLevel } from "./student";

export type TuitionCategoryId =
  | "elementary-lower"    // 小学生低学年 (1-3年)
  | "elementary-upper"    // 小学生高学年 (4-6年)
  | "elementary-exam"     // 小学生(中学受験)
  | "junior-12"           // 中学生(1,2年生)
  | "junior-3"            // 中学生(3年生)
  | "high-all"            // 高校生(全学年)
  | "adult";              // 社会人

export interface TuitionCategory {
  id: TuitionCategoryId;
  label: string;
  monthlyFee: number;       // 月謝（円）
  sessionsPerMonth: number; // 月あたり授業回数
  updatedAt: string;
}

export const DEFAULT_TUITION_CATEGORIES: TuitionCategory[] = [
  { id: "elementary-lower", label: "小学生低学年 (1-3年)", monthlyFee: 6000, sessionsPerMonth: 4, updatedAt: "" },
  { id: "elementary-upper", label: "小学生高学年 (4-6年)", monthlyFee: 8000, sessionsPerMonth: 4, updatedAt: "" },
  { id: "elementary-exam", label: "小学生(中学受験)", monthlyFee: 10000, sessionsPerMonth: 4, updatedAt: "" },
  { id: "junior-12", label: "中学生(1,2年生)", monthlyFee: 10000, sessionsPerMonth: 4, updatedAt: "" },
  { id: "junior-3", label: "中学生(3年生)", monthlyFee: 12000, sessionsPerMonth: 4, updatedAt: "" },
  { id: "high-all", label: "高校生(全学年)", monthlyFee: 18000, sessionsPerMonth: 4, updatedAt: "" },
  { id: "adult", label: "社会人", monthlyFee: 20000, sessionsPerMonth: 4, updatedAt: "" },
];

export function getTuitionCategoryForGradeLevel(gradeLevel: GradeLevel): TuitionCategoryId {
  switch (gradeLevel) {
    case "elementary-1":
    case "elementary-2":
    case "elementary-3":
      return "elementary-lower";
    case "elementary-4":
    case "elementary-5":
    case "elementary-6":
      return "elementary-upper";
    case "junior-1":
    case "junior-2":
      return "junior-12";
    case "junior-3":
      return "junior-3";
    case "high-1":
    case "high-2":
    case "high-3":
      return "high-all";
    case "adult":
      return "adult";
  }
}
