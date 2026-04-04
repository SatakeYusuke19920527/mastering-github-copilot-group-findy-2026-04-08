"use client";

import { useState } from "react";
import { SUBJECTS } from "@/lib/types";

export function PortalAbsenceForm() {
  const [studentName, setStudentName] = useState("");
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "",
          studentName,
          originalDate: date,
          subject,
          reason,
          status: "reported",
          reportedBy: "parent",
        }),
      });

      if (res.ok) {
        setResult("success");
        setStudentName("");
        setDate("");
        setSubject("");
        setReason("");
      } else {
        setResult("error");
      }
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          欠席連絡を送信しました。
        </div>
      )}
      {result === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          送信に失敗しました。もう一度お試しください。
        </div>
      )}

      <div>
        <label htmlFor="studentName" className="block text-sm font-medium text-gray-900 mb-1">
          生徒名
        </label>
        <input
          id="studentName"
          type="text"
          required
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="例: 佐竹 太郎"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-1">
          欠席日
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-1">
          科目
        </label>
        <select
          id="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-900 mb-1">
          理由
        </label>
        <textarea
          id="reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="欠席の理由をご入力ください"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "送信中..." : "欠席連絡を送信"}
      </button>
    </form>
  );
}
