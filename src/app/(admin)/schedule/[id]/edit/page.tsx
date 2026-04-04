import { getSchedule } from "@/lib/schedules";
import { ScheduleForm } from "@/components/schedule-form";
import { notFound } from "next/navigation";

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

  const schedule = await getSchedule(id, Number(dayOfWeek));
  if (!schedule) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        授業編集 — {schedule.subject}
      </h1>
      <ScheduleForm mode="edit" schedule={schedule} />
    </div>
  );
}
