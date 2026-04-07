import Link from "next/link";
import { listSchedules } from "@/lib/schedules";
import { listStudents } from "@/lib/students";
import { listAbsences } from "@/lib/absences";
import { ScheduleTimetable } from "@/components/schedule-timetable";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [schedules, students, rescheduledAbsences] = await Promise.all([
    listSchedules(),
    listStudents({ enrollmentStatus: "enrolled" }),
    listAbsences({ status: "rescheduled" }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          授業スケジュール管理
        </h1>
        <Link
          href="/schedule/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          ＋ 新規登録
        </Link>
      </div>
      <ScheduleTimetable schedules={schedules} students={students} rescheduledAbsences={rescheduledAbsences} />
    </div>
  );
}
