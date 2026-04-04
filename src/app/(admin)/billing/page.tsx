import Link from "next/link";
import { listBillingRecords } from "@/lib/billing";
import { listStudents } from "@/lib/students";
import { BillingList } from "@/components/billing-list";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const [records, students] = await Promise.all([
    listBillingRecords(),
    listStudents({ enrollmentStatus: "enrolled" }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">請求/入金管理</h1>
        <Link
          href="/billing/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          ＋ 新規登録
        </Link>
      </div>
      <BillingList initialRecords={records} students={students} />
    </div>
  );
}
