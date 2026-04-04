import { getStudent } from "@/lib/students";
import { StudentForm } from "@/components/student-form";
import { notFound } from "next/navigation";

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        生徒編集 — {student.lastName} {student.firstName}
      </h1>
      <StudentForm mode="edit" student={student} />
    </div>
  );
}
