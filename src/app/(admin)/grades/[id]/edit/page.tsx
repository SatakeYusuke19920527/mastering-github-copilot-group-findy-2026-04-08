import { getGrade } from "@/lib/grades";
import { GradeForm } from "@/components/grade-form";
import { notFound } from "next/navigation";

export default async function EditGradePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { id } = await params;
  const { studentId } = await searchParams;

  if (!studentId) notFound();

  const grade = await getGrade(id, studentId);
  if (!grade) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        成績編集 — {grade.studentName}（{grade.examName}）
      </h1>
      <GradeForm mode="edit" grade={grade} />
    </div>
  );
}
