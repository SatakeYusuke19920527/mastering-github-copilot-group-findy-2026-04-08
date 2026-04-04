import type { GradeLevel } from "./student";

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "日",
  1: "月",
  2: "火",
  3: "水",
  4: "木",
  5: "金",
  6: "土",
};

export const ROOMS = ["A教室", "B教室"] as const;
export type Room = (typeof ROOMS)[number];

/** 時間割の時限定義 */
export interface PeriodDef {
  period: number;
  label: string;
  aStart: string;
  aEnd: string;
  bStart: string;
  bEnd: string;
}

export const PERIODS: PeriodDef[] = [
  { period: 1, label: "1時間目", aStart: "13:00", aEnd: "14:00", bStart: "13:00", bEnd: "14:30" },
  { period: 2, label: "2時間目", aStart: "14:40", aEnd: "15:40", bStart: "14:40", bEnd: "16:10" },
  { period: 3, label: "3時間目", aStart: "16:20", aEnd: "17:20", bStart: "15:50", bEnd: "17:20" },
  { period: 4, label: "4時間目", aStart: "17:30", aEnd: "19:00", bStart: "17:30", bEnd: "19:00" },
  { period: 5, label: "5時間目", aStart: "19:30", aEnd: "21:00", bStart: "19:30", bEnd: "21:00" },
  { period: 6, label: "6時間目", aStart: "21:10", aEnd: "22:40", bStart: "21:10", bEnd: "22:40" },
];

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0 (日) – 6 (土)  ← partition key
  period: number; // 1–6 時限
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  label: string; // 表示名 (e.g. "小学低学年", "新中1国語")
  subject: string;
  gradeLevel: GradeLevel;
  teacherName: string;
  room: Room;
  maxStudents: number;
  enrolledStudentIds: string[];
  isActive: boolean;
  isSpringCourse: boolean; // ◎ 春期講習
  isImportant: boolean; // 太字表示
  createdAt: string;
  updatedAt: string;
}

// Cosmos DB partition key: dayOfWeek
export type ScheduleCreateInput = Omit<Schedule, "id" | "createdAt" | "updatedAt">;
export type ScheduleUpdateInput = Partial<ScheduleCreateInput>;
