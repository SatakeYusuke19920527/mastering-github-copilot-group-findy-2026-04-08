"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Schedule, ScheduleCreateInput, GradeLevel, Room } from "@/lib/types";
import { GRADE_LABELS, DAY_OF_WEEK_LABELS, ROOMS, PERIODS } from "@/lib/types";

const ALL_GRADES = Object.keys(GRADE_LABELS) as GradeLevel[];
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0]; // 月〜土, 日

interface ScheduleFormProps {
  schedule?: Schedule;
  mode: "create" | "edit";
  defaultValues?: {
    dayOfWeek?: number;
    period?: number;
    room?: string;
  };
}

export function ScheduleForm({ schedule, mode, defaultValues }: ScheduleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  function updateTimesFromPeriod(periodNum: number, room: string) {
    const p = PERIODS.find((pd) => pd.period === periodNum);
    if (!p) return;
    const isB = room === "B教室";
    if (startTimeRef.current) startTimeRef.current.value = isB ? p.bStart : p.aStart;
    if (endTimeRef.current) endTimeRef.current.value = isB ? p.bEnd : p.aEnd;
  }

  // Compute initial times from defaultValues or schedule
  const initialPeriod = schedule?.period ?? defaultValues?.period;
  const initialRoom = schedule?.room ?? defaultValues?.room ?? ROOMS[0];
  let initialStartTime = schedule?.startTime ?? "16:00";
  let initialEndTime = schedule?.endTime ?? "17:30";
  if (initialPeriod) {
    const p = PERIODS.find((pd) => pd.period === initialPeriod);
    if (p) {
      const isB = initialRoom === "B教室";
      initialStartTime = isB ? p.bStart : p.aStart;
      initialEndTime = isB ? p.bEnd : p.aEnd;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data: ScheduleCreateInput = {
      dayOfWeek: Number(formData.get("dayOfWeek")),
      period: Number(formData.get("period")),
      label: formData.get("label") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      subject: formData.get("subject") as string,
      gradeLevel: formData.get("gradeLevel") as GradeLevel,
      teacherName: formData.get("teacherName") as string,
      room: formData.get("room") as Room,
      maxStudents: Number(formData.get("maxStudents")),
      enrolledStudentIds: schedule?.enrolledStudentIds ?? [],
      isActive: formData.get("isActive") === "on",
      isSpringCourse: formData.get("isSpringCourse") === "on",
      isImportant: formData.get("isImportant") === "on",
    };

    try {
      const url =
        mode === "create"
          ? "/api/schedules"
          : `/api/schedules/${schedule!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const body =
        mode === "edit"
          ? { ...data, dayOfWeek: schedule!.dayOfWeek }
          : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      router.push("/schedule");
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
          授業情報
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">曜日</span>
            <select
              name="dayOfWeek"
              defaultValue={schedule?.dayOfWeek ?? defaultValues?.dayOfWeek ?? 1}
              disabled={mode === "edit"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
            >
              {ALL_DAYS.map((d) => (
                <option key={d} value={d}>
                  {DAY_OF_WEEK_LABELS[d]}曜日
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">時限</span>
            <select
              name="period"
              defaultValue={schedule?.period ?? defaultValues?.period ?? 1}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              onChange={(e) => {
                const form = e.target.form;
                if (!form) return;
                const room = (form.elements.namedItem("room") as HTMLSelectElement)?.value ?? ROOMS[0];
                updateTimesFromPeriod(Number(e.target.value), room);
              }}
            >
              {PERIODS.map((p) => (
                <option key={p.period} value={p.period}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">表示名</span>
            <input
              name="label"
              defaultValue={schedule?.label ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              placeholder="例: 小学低学年、新中1国語"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">科目（自由入力）</span>
            <input
              name="subject"
              defaultValue={schedule?.subject ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              placeholder="例: 国語、数学、総合、プログラミング"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">教室</span>
            <select
              name="room"
              defaultValue={schedule?.room ?? defaultValues?.room ?? ROOMS[0]}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              onChange={(e) => {
                const form = e.target.form;
                if (!form) return;
                const periodVal = (form.elements.namedItem("period") as HTMLSelectElement)?.value;
                if (periodVal) updateTimesFromPeriod(Number(periodVal), e.target.value);
              }}
            >
              {ROOMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">対象学年</span>
            <select
              name="gradeLevel"
              defaultValue={schedule?.gradeLevel ?? "junior-1"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {GRADE_LABELS[g]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">開始時間</span>
            <input
              ref={startTimeRef}
              name="startTime"
              type="time"
              defaultValue={initialStartTime}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">終了時間</span>
            <input
              ref={endTimeRef}
              name="endTime"
              type="time"
              defaultValue={initialEndTime}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">担当講師</span>
            <input
              name="teacherName"
              defaultValue={schedule?.teacherName}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">定員</span>
            <input
              name="maxStudents"
              type="number"
              min={1}
              defaultValue={schedule?.maxStudents ?? 20}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={schedule?.isActive ?? true}
              className="rounded border-gray-300"
            />
            <span className="font-medium text-gray-900">有効</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isSpringCourse"
              defaultChecked={schedule?.isSpringCourse ?? false}
              className="rounded border-gray-300"
            />
            <span className="font-medium text-gray-900">◎春期講習</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isImportant"
              defaultChecked={schedule?.isImportant ?? false}
              className="rounded border-gray-300"
            />
            <span className="font-medium text-gray-900">重要（太字表示）</span>
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
