import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listAbsences, updateAbsence } from "@/lib/absences";
import { bulkReschedule } from "@/lib/ai/reschedule";

function getNextWeekday(targetDay: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  return nextDate.toISOString().split("T")[0];
}

export async function POST() {
  try {
    await auth.protect();
    const reportedAbsences = await listAbsences({ status: "reported" });

    if (reportedAbsences.length === 0) {
      return NextResponse.json({ message: "振替対象の欠席がありません", results: [] });
    }

    const results = await bulkReschedule(reportedAbsences);

    for (const result of results) {
      if (result.success && result.scheduleId && result.dayOfWeek != null) {
        const nextDate = getNextWeekday(result.dayOfWeek);
        await updateAbsence(result.absenceId, result.studentId, {
          status: "rescheduled",
          rescheduledScheduleId: result.scheduleId,
          rescheduledDate: nextDate,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `${successCount}件の振替を実行しました${failCount > 0 ? `（${failCount}件は振替先なし）` : ""}`,
      results,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("一括振替エラー:", error);
    return NextResponse.json({ error: "一括振替処理中にエラーが発生しました" }, { status: 500 });
  }
}
