import Link from "next/link";
import { listAbsences } from "@/lib/absences";
import { AbsenceKanban } from "@/components/absence-kanban";

export const dynamic = "force-dynamic";

export default async function AbsencesPage() {
  const absences = await listAbsences();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">欠席管理</h1>
        <Link
          href="/absences/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          ＋ 欠席報告
        </Link>
      </div>
      <AbsenceKanban initialAbsences={absences} />
    </div>
  );
}
