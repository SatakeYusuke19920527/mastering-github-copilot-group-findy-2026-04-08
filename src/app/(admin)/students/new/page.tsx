import { StudentForm } from "@/components/student-form";

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">生徒登録</h1>
      <StudentForm mode="create" />
    </div>
  );
}
