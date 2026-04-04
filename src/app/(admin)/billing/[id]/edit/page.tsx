import { getBillingRecord } from "@/lib/billing";
import { BillingForm } from "@/components/billing-form";
import { notFound } from "next/navigation";

export default async function EditBillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { id } = await params;
  const { studentId } = await searchParams;

  if (!studentId) notFound();

  const record = await getBillingRecord(id, studentId);
  if (!record) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        請求編集 — {record.studentName}
      </h1>
      <BillingForm mode="edit" record={record} />
    </div>
  );
}
