import { GradeForm } from "@/components/grade-form";

export default function NewGradePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">成績登録</h1>
      <GradeForm mode="create" />
    </div>
  );
}
