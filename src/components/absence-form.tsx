"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AbsenceRecord,
  AbsenceStatus,
  AbsenceReportedBy,
  AbsenceCreateInput,
} from "@/lib/types";
import { ABSENCE_STATUS_LABELS, REPORTED_BY_LABELS } from "@/lib/types";

const SUBJECTS = ["国語", "数学", "英語", "理科", "社会"];
const ALL_STATUSES = Object.keys(ABSENCE_STATUS_LABELS) as AbsenceStatus[];
const ALL_REPORTED_BY = Object.keys(REPORTED_BY_LABELS) as AbsenceReportedBy[];

interface AbsenceFormProps {
  absence?: AbsenceRecord;
  mode: "create" | "edit";
}

export function AbsenceForm({ absence, mode }: AbsenceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data: AbsenceCreateInput = {
      studentId: formData.get("studentId") as string,
      studentName: formData.get("studentName") as string,
      gradeLevel: (formData.get("gradeLevel") as string) || "",
      originalDate: formData.get("originalDate") as string,
      originalScheduleId: (formData.get("originalScheduleId") as string) || undefined,
      schedulePeriod: (formData.get("schedulePeriod") as string) || undefined,
      subject: formData.get("subject") as string,
      reason: formData.get("reason") as string,
      status: (formData.get("status") as AbsenceStatus) ?? "reported",
      rescheduledDate: (formData.get("rescheduledDate") as string) || undefined,
      rescheduledScheduleId: (formData.get("rescheduledScheduleId") as string) || undefined,
      reportedBy: formData.get("reportedBy") as AbsenceReportedBy,
      notes: (formData.get("notes") as string) || undefined,
    };

    try {
      const url =
        mode === "create"
          ? "/api/absences"
          : `/api/absences/${absence!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const body =
        mode === "edit"
          ? { ...data, studentId: absence!.studentId }
          : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      router.push("/absences");
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
          欠席情報
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">生徒ID</span>
            <input
              name="studentId"
              defaultValue={absence?.studentId}
              required
              readOnly={mode === "edit"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm read-only:bg-gray-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">生徒氏名</span>
            <input
              name="studentName"
              defaultValue={absence?.studentName}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">欠席日</span>
            <input
              name="originalDate"
              type="date"
              defaultValue={absence?.originalDate}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">科目</span>
            <select
              name="subject"
              defaultValue={absence?.subject ?? SUBJECTS[0]}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">欠席理由</span>
          <input
            name="reason"
            defaultValue={absence?.reason}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">報告者</span>
            <select
              name="reportedBy"
              defaultValue={absence?.reportedBy ?? "parent"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {ALL_REPORTED_BY.map((r) => (
                <option key={r} value={r}>
                  {REPORTED_BY_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">ステータス</span>
            <select
              name="status"
              defaultValue={absence?.status ?? "reported"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ABSENCE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">
          振替情報
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">振替日</span>
            <input
              name="rescheduledDate"
              type="date"
              defaultValue={absence?.rescheduledDate}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">
              振替スケジュールID
            </span>
            <input
              name="rescheduledScheduleId"
              defaultValue={absence?.rescheduledScheduleId}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-gray-900">備考</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={absence?.notes}
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
