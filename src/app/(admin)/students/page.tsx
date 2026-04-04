import Link from "next/link";
import { listStudents } from "@/lib/students";
import { StudentList } from "@/components/student-list";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await listStudents({ enrollmentStatus: "enrolled" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">生徒管理</h1>
        <Link
          href="/students/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          ＋ 新規登録
        </Link>
      </div>
      <StudentList initialStudents={students} />
    </div>
  );
}
