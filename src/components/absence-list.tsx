"use client";

import { useState } from "react";
import Link from "next/link";
import type { AbsenceRecord, AbsenceStatus } from "@/lib/types";
import { ABSENCE_STATUS_LABELS } from "@/lib/types";

const ALL_STATUSES = Object.keys(ABSENCE_STATUS_LABELS) as AbsenceStatus[];

interface AbsenceListProps {
  initialAbsences: AbsenceRecord[];
}

export function AbsenceList({ initialAbsences }: AbsenceListProps) {
  const [absences, setAbsences] = useState(initialAbsences);
  const [studentFilter, setStudentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function applyFilters(
    student: string,
    status: string,
    from: string,
    to: string
  ) {
    const params = new URLSearchParams();
    if (student) params.set("studentId", student);
    if (status) params.set("status", status);
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);

    const res = await fetch(`/api/absences?${params}`);
    const data = await res.json();
    setAbsences(data);
  }

  async function handleDelete(absence: AbsenceRecord) {
    if (!confirm(`${absence.studentName} の欠席記録を削除しますか？`)) return;
    setDeleting(absence.id);
    try {
      await fetch(
        `/api/absences/${absence.id}?studentId=${absence.studentId}`,
        { method: "DELETE" }
      );
      setAbsences((prev) => prev.filter((a) => a.id !== absence.id));
    } finally {
      setDeleting(null);
    }
  }

  const statusColor: Record<AbsenceStatus, string> = {
    reported: "bg-yellow-100 text-yellow-800",
    rescheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="生徒IDで絞り込み"
          value={studentFilter}
          onChange={(e) => {
            setStudentFilter(e.target.value);
            applyFilters(e.target.value, statusFilter, dateFrom, dateTo);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            applyFilters(studentFilter, e.target.value, dateFrom, dateTo);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="">全ステータス</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ABSENCE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            applyFilters(studentFilter, statusFilter, e.target.value, dateTo);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
        <span className="text-sm text-gray-900">〜</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            applyFilters(studentFilter, statusFilter, dateFrom, e.target.value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
        <span className="text-sm text-gray-900">{absences.length}件</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                生徒名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                欠席日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                科目
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                理由
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                ステータス
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                振替日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {absences.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-900">
                  欠席記録がありません
                </td>
              </tr>
            ) : (
              absences.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link
                      href={`/absences/${a.id}/edit?studentId=${a.studentId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {a.studentName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{a.originalDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{a.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{a.reason}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}
                    >
                      {ABSENCE_STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {a.rescheduledDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <button
                      onClick={() => handleDelete(a)}
                      disabled={deleting === a.id}
                      className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                    >
                      {deleting === a.id ? "削除中..." : "削除"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
