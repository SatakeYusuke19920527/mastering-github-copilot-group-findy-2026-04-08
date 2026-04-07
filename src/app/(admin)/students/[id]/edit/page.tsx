import { getStudent } from "@/lib/students";
import { listSchedulesByStudentId } from "@/lib/schedules";
import { StudentForm } from "@/components/student-form";
import { StudentScheduleList } from "@/components/student-schedule-list";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gradeLevel?: string }>;
}) {
  const { id } = await params;
  const { gradeLevel } = await searchParams;

  if (!gradeLevel) notFound();

  const student = await getStudent(id, gradeLevel);
  if (!student) notFound();

  const schedules = await listSchedulesByStudentId(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        生徒編集 — {student.lastName} {student.firstName}
      </h1>
      <StudentForm mode="edit" student={student} />
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">受講中のスケジュール</h2>
        <StudentScheduleList schedules={schedules} />
      </div>
    </div>
  );
}
