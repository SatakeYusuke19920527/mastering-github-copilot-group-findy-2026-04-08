"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ExamResult, ExamResultCreateInput, ExamType } from "@/lib/types";
import { EXAM_TYPE_LABELS, SUBJECTS } from "@/lib/types";
import type { Student } from "@/lib/types";

const ALL_EXAM_TYPES = Object.keys(EXAM_TYPE_LABELS) as ExamType[];

interface GradeFormProps {
  grade?: ExamResult;
  mode: "create" | "edit";
}

export function GradeForm({ grade, mode }: GradeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch("/api/students?enrollmentStatus=enrolled")
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const selectedStudent = students.find(
      (s) => s.id === formData.get("studentId")
    );

    const data: ExamResultCreateInput = {
      studentId: formData.get("studentId") as string,
      studentName: selectedStudent
        ? `${selectedStudent.lastName} ${selectedStudent.firstName}`
        : (grade?.studentName ?? ""),
      examType: formData.get("examType") as ExamType,
      examName: formData.get("examName") as string,
      date: formData.get("date") as string,
      subject: formData.get("subject") as string,
      score: Number(formData.get("score")),
      maxScore: Number(formData.get("maxScore")),
      rank: formData.get("rank") ? Number(formData.get("rank")) : undefined,
      totalStudents: formData.get("totalStudents")
        ? Number(formData.get("totalStudents"))
        : undefined,
    };

    try {
      const url =
        mode === "create"
          ? "/api/grades"
          : `/api/grades/${grade!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const body =
        mode === "edit"
          ? { ...data, studentId: grade!.studentId }
          : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      router.push("/grades");
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
          試験情報
        </legend>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">生徒</span>
          <select
            name="studentId"
            defaultValue={grade?.studentId ?? ""}
            required
            disabled={mode === "edit"}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          >
            <option value="">選択してください</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.lastName} {s.firstName}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">試験種別</span>
            <select
              name="examType"
              defaultValue={grade?.examType ?? "regular"}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {ALL_EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EXAM_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">科目</span>
            <select
              name="subject"
              defaultValue={grade?.subject ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              <option value="">選択してください</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">試験名</span>
            <input
              name="examName"
              defaultValue={grade?.examName}
              required
              placeholder="例：1学期中間テスト"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">実施日</span>
            <input
              name="date"
              type="date"
              defaultValue={grade?.date ?? new Date().toISOString().split("T")[0]}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">
          成績
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">得点</span>
            <input
              name="score"
              type="number"
              min={0}
              defaultValue={grade?.score}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">満点</span>
            <input
              name="maxScore"
              type="number"
              min={1}
              defaultValue={grade?.maxScore ?? 100}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">
              順位（任意）
            </span>
            <input
              name="rank"
              type="number"
              min={1}
              defaultValue={grade?.rank}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">
              総人数（任意）
            </span>
            <input
              name="totalStudents"
              type="number"
              min={1}
              defaultValue={grade?.totalStudents}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>
      </fieldset>

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
