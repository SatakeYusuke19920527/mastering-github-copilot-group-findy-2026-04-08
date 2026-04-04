import Link from "next/link";
import { listGrades } from "@/lib/grades";
import { listStudents } from "@/lib/students";
import { GradeList } from "@/components/grade-list";

export const dynamic = "force-dynamic";

export default async function GradesPage() {
  const [grades, students] = await Promise.all([
    listGrades(),
    listStudents(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">成績管理</h1>
        <Link
          href="/grades/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          ＋ 成績登録
        </Link>
      </div>
      <GradeList initialGrades={grades} students={students} />
    </div>
  );
}
