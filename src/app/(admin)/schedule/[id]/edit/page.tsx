import { getSchedule } from "@/lib/schedules";
import { listStudents } from "@/lib/students";
import { ScheduleForm } from "@/components/schedule-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditSchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dayOfWeek?: string }>;
}) {
  const { id } = await params;
  const { dayOfWeek } = await searchParams;

  if (!dayOfWeek) notFound();

  const [schedule, students] = await Promise.all([
    getSchedule(id, Number(dayOfWeek)),
    listStudents({ enrollmentStatus: "enrolled" }),
  ]);
  if (!schedule) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        授業編集 — {schedule.subject}
      </h1>
      <ScheduleForm mode="edit" schedule={schedule} students={students} />
    </div>
  );
}
