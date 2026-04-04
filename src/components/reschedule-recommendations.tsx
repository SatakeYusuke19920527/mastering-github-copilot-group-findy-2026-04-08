"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RescheduleRecommendation } from "@/lib/ai/reschedule";
import { DAY_OF_WEEK_LABELS } from "@/lib/types";

interface Props {
  absenceId: string;
  studentId: string;
}

export function RescheduleRecommendations({ absenceId, studentId }: Props) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<
    RescheduleRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch(
          `/api/absences/${absenceId}/recommendations?studentId=${encodeURIComponent(studentId)}`,
        );
        if (!res.ok) throw new Error("レコメンドの取得に失敗しました");
        const data = await res.json();
        setRecommendations(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "エラーが発生しました",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [absenceId, studentId]);

  async function handleReschedule(rec: RescheduleRecommendation) {
    setSubmitting(rec.scheduleId);
    try {
      const today = new Date();
      const dayDiff =
        (rec.dayOfWeek - today.getDay() + 7) % 7 || 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + dayDiff);
      const rescheduledDate = nextDate.toISOString().split("T")[0];

      const res = await fetch(`/api/absences/${absenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          rescheduledDate,
          rescheduledScheduleId: rec.scheduleId,
          status: "rescheduled",
        }),
      });
      if (!res.ok) throw new Error("振替の登録に失敗しました");
      router.push("/absences");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました",
      );
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-900">振替候補を検索中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-md text-sm">
        {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          振替候補
        </h2>
        <p className="text-gray-900">
          条件に合う振替候補が見つかりませんでした。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        AIおすすめ振替候補
      </h2>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.scheduleId}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {DAY_OF_WEEK_LABELS[rec.dayOfWeek]}曜日 {rec.startTime}〜
                    {rec.endTime}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {rec.subject}
                  </span>
                  <span className="text-xs text-gray-900">
                    {rec.room}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-900">
                      スコア:
                    </span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${rec.score}%`,
                          backgroundColor:
                            rec.score >= 80
                              ? "#22c55e"
                              : rec.score >= 50
                                ? "#eab308"
                                : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {rec.score}
                    </span>
                  </div>
                  <span className="text-xs text-gray-900">
                    空席: {rec.availableSlots}名
                  </span>
                </div>
                <p className="text-xs text-gray-900">{rec.reason}</p>
              </div>
              <button
                type="button"
                onClick={() => handleReschedule(rec)}
                disabled={submitting !== null}
                className="ml-4 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {submitting === rec.scheduleId
                  ? "処理中..."
                  : "この日程で振替"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
