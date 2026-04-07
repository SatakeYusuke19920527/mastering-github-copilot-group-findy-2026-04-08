import Link from "next/link";
import type { Schedule } from "@/lib/types";
import { DAY_OF_WEEK_LABELS, PERIODS } from "@/lib/types";

function getPeriodLabel(period: number): string {
  return PERIODS.find((p) => p.period === period)?.label ?? `${period}時間目`;
}

export function StudentScheduleList({ schedules }: { schedules: Schedule[] }) {
  if (schedules.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        受講中のスケジュールはありません
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left border-b border-gray-200">曜日</th>
            <th className="px-4 py-2 text-left border-b border-gray-200">時限</th>
            <th className="px-4 py-2 text-left border-b border-gray-200">科目</th>
            <th className="px-4 py-2 text-left border-b border-gray-200">教室</th>
            <th className="px-4 py-2 text-left border-b border-gray-200">担当講師</th>
            <th className="px-4 py-2 text-left border-b border-gray-200">時間</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b border-gray-200">
                <Link
                  href={`/schedule/${schedule.id}/edit?dayOfWeek=${schedule.dayOfWeek}`}
                  className="text-blue-600 hover:underline"
                >
                  {DAY_OF_WEEK_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}
                </Link>
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {getPeriodLabel(schedule.period)}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {schedule.subject}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {schedule.room}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {schedule.teacherName}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {schedule.startTime} – {schedule.endTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
