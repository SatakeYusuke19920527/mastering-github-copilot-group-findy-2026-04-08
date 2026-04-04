"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Student,
  GradeLevel,
  StudentCreateInput,
} from "@/lib/types";
import { GRADE_LABELS, ENROLLMENT_STATUS_LABELS } from "@/lib/types";

const ALL_GRADES = Object.keys(GRADE_LABELS) as GradeLevel[];
const SUBJECTS = ["国語", "数学", "英語", "理科", "社会"];

interface StudentFormProps {
  student?: Student;
  mode: "create" | "edit";
}

export function StudentForm({ student, mode }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const selectedSubjects = SUBJECTS.filter(
      (s) => formData.get(`subject-${s}`) === "on"
    );

    const data: StudentCreateInput = {
      lastName: formData.get("lastName") as string,
      firstName: formData.get("firstName") as string,
      lastNameKana: formData.get("lastNameKana") as string,
      firstNameKana: formData.get("firstNameKana") as string,
      gradeLevel: formData.get("gradeLevel") as GradeLevel,
      school: formData.get("school") as string,
      enrollmentStatus: student?.enrollmentStatus ?? "enrolled",
      enrolledAt: student?.enrolledAt ?? new Date().toISOString().split("T")[0],
      parent: {
        name: formData.get("parentName") as string,
        phone: formData.get("parentPhone") as string,
        email: formData.get("parentEmail") as string,
      },
      subjects: selectedSubjects,
      notes: (formData.get("notes") as string) || undefined,
    };

    try {
      const url =
        mode === "create"
          ? "/api/students"
          : `/api/students/${student!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const body =
        mode === "edit"
          ? { ...data, gradeLevel: student!.gradeLevel }
          : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      router.push("/students");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">
          生徒情報
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">姓</span>
            <input
              name="lastName"
              defaultValue={student?.lastName}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">名</span>
            <input
              name="firstName"
              defaultValue={student?.firstName}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">
              姓（カナ）
            </span>
            <input
              name="lastNameKana"
              defaultValue={student?.lastNameKana}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">
              名（カナ）
            </span>
            <input
              name="firstNameKana"
              defaultValue={student?.firstNameKana}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">学年</span>
            <select
              name="gradeLevel"
              defaultValue={student?.gradeLevel ?? "junior-1"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {GRADE_LABELS[g]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">学校名</span>
            <input
              name="school"
              defaultValue={student?.school}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-900">受講科目</span>
          <div className="mt-2 flex gap-4 flex-wrap">
            {SUBJECTS.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`subject-${s}`}
                  defaultChecked={student?.subjects.includes(s)}
                  className="rounded border-gray-300"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">
          保護者情報
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">
              保護者氏名
            </span>
            <input
              name="parentName"
              defaultValue={student?.parent.name}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">電話番号</span>
            <input
              name="parentPhone"
              type="tel"
              defaultValue={student?.parent.phone}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-gray-900">
            メールアドレス
          </span>
          <input
            name="parentEmail"
            type="email"
            defaultValue={student?.parent.email}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </label>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-gray-900">備考</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={student?.notes}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "保存中..."
            : mode === "create"
              ? "登録する"
              : "更新する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
