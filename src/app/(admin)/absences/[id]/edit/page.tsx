import { getAbsence } from "@/lib/absences";
import { AbsenceForm } from "@/components/absence-form";
import { RescheduleRecommendations } from "@/components/reschedule-recommendations";
import { notFound } from "next/navigation";

export default async function EditAbsencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { id } = await params;
  const { studentId } = await searchParams;

  if (!studentId) notFound();

  const absence = await getAbsence(id, studentId);
  if (!absence) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        欠席編集 — {absence.studentName}
      </h1>
      <AbsenceForm mode="edit" absence={absence} />
      <RescheduleRecommendations absenceId={id} studentId={absence.studentId} />
    </div>
  );
}
