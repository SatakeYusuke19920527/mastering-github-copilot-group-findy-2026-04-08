import { ScheduleForm } from "@/components/schedule-form";
import { listStudents } from "@/lib/students";

export const dynamic = "force-dynamic";

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ dayOfWeek?: string; period?: string; room?: string }>;
}) {
  const [params, students] = await Promise.all([
    searchParams,
    listStudents({ enrollmentStatus: "enrolled" }),
  ]);

  const defaultValues = {
    dayOfWeek: params.dayOfWeek ? Number(params.dayOfWeek) : undefined,
    period: params.period ? Number(params.period) : undefined,
    room: params.room ?? undefined,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">授業登録</h1>
      <ScheduleForm mode="create" defaultValues={defaultValues} students={students} />
    </div>
  );
}
