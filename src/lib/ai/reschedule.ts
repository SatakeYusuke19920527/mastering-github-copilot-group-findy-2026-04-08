// 将来的にはOpenAI APIを利用して、生徒の学習傾向や過去の振替パターンを考慮したレコメンドに拡張予定

import { listSchedules } from "@/lib/schedules";
import type { AbsenceRecord, Schedule } from "@/lib/types";

export interface RescheduleRecommendation {
  scheduleId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  availableSlots: number;
  score: number; // 0-100
  reason: string;
}

/**
 * 欠席レコードと生徒IDをもとに、振替候補スケジュールをスコア付きで返す
 */
export async function getRecommendations(
  absenceRecord: AbsenceRecord,
  _studentId: string,
): Promise<RescheduleRecommendation[]> {
  const schedules = await listSchedules({ subject: absenceRecord.subject });

  const originalDayOfWeek = new Date(absenceRecord.originalDate).getDay();

  const candidates: RescheduleRecommendation[] = [];

  for (const schedule of schedules) {
    if (!schedule.isActive) continue;

    const capacity = schedule.maxStudents - schedule.enrolledStudentIds.length;
    if (capacity <= 0) continue;

    // 同じ曜日（欠席日と同じ曜日）は除外
    if (schedule.dayOfWeek === originalDayOfWeek) continue;

    const score = calculateScore(schedule, absenceRecord, capacity);

    const reasons: string[] = [];
    if (schedule.subject === absenceRecord.subject) {
      reasons.push("同一科目");
    }
    if (capacity >= 3) {
      reasons.push("空席に余裕あり");
    }
    reasons.push(`残り${capacity}席`);

    candidates.push({
      scheduleId: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      subject: schedule.subject,
      room: schedule.room,
      availableSlots: capacity,
      score,
      reason: reasons.join("・"),
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, 5);
}

function calculateScore(
  schedule: Schedule,
  absenceRecord: AbsenceRecord,
  capacity: number,
): number {
  let score = 0;

  // 同一科目マッチ（最高優先度: 40点）
  if (schedule.subject === absenceRecord.subject) {
    score += 40;
  }

  // 空席数スコア（最大20点）
  const capacityScore = Math.min(capacity / schedule.maxStudents, 1) * 20;
  score += capacityScore;

  // 曜日の近さスコア（最大20点）
  const originalDay = new Date(absenceRecord.originalDate).getDay();
  const dayDiff = Math.abs(schedule.dayOfWeek - originalDay);
  const proximity = Math.min(dayDiff, 7 - dayDiff);
  score += Math.max(0, 20 - proximity * 4);

  // 基本スコア（アクティブかつ空席があるだけで20点）
  score += 20;

  return Math.round(Math.min(score, 100));
}

export interface BulkRescheduleResult {
  absenceId: string;
  studentId: string;
  studentName: string;
  success: boolean;
  scheduleId?: string;
  dayOfWeek?: number;
  scheduleSummary?: string;
  error?: string;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export async function bulkReschedule(
  absences: AbsenceRecord[],
): Promise<BulkRescheduleResult[]> {
  const schedules = await listSchedules();
  const allocatedSlots = new Map<string, number>();
  const results: BulkRescheduleResult[] = [];

  for (const absence of absences) {
    const originalDayOfWeek = new Date(absence.originalDate).getDay();
    const scored: { schedule: Schedule; score: number }[] = [];

    for (const schedule of schedules) {
      if (!schedule.isActive) continue;
      const allocated = allocatedSlots.get(schedule.id) ?? 0;
      const capacity = schedule.maxStudents - schedule.enrolledStudentIds.length - allocated;
      if (capacity <= 0) continue;
      if (schedule.gradeLevel !== absence.gradeLevel) continue;
      if (schedule.enrolledStudentIds.includes(absence.studentId)) continue;
      if (schedule.dayOfWeek === originalDayOfWeek) continue;

      const score = calculateScore(schedule, absence, capacity);
      scored.push({ schedule, score });
    }

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    if (best) {
      allocatedSlots.set(best.schedule.id, (allocatedSlots.get(best.schedule.id) ?? 0) + 1);
      const dayLabel = DAY_LABELS[best.schedule.dayOfWeek];
      results.push({
        absenceId: absence.id,
        studentId: absence.studentId,
        studentName: absence.studentName,
        success: true,
        scheduleId: best.schedule.id,
        dayOfWeek: best.schedule.dayOfWeek,
        scheduleSummary: `${dayLabel}曜 ${best.schedule.startTime}-${best.schedule.endTime} ${best.schedule.subject} ${best.schedule.room}`,
      });
    } else {
      results.push({
        absenceId: absence.id,
        studentId: absence.studentId,
        studentName: absence.studentName,
        success: false,
        error: "条件に合う振替先が見つかりませんでした",
      });
    }
  }
  return results;
}
