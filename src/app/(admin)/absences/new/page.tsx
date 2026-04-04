import { AbsenceForm } from "@/components/absence-form";

export default function NewAbsencePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">欠席報告</h1>
      <AbsenceForm mode="create" />
    </div>
  );
}
