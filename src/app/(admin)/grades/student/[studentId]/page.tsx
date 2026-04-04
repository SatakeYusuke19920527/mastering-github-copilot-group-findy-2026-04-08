import { listGrades } from "@/lib/grades";
import { StudentGradeChart } from "@/components/student-grade-chart";

export const dynamic = "force-dynamic";

export default async function StudentGradePage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { studentId } = await params;
  const { name } = await searchParams;
  const grades = await listGrades({ studentId });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {name || "生徒"}の成績推移
      </h1>
      <StudentGradeChart grades={grades} />
    </div>
  );
}
