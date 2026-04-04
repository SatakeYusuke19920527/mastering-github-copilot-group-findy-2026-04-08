"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BillingRecord, BillingStatus, Student } from "@/lib/types";
import { BILLING_STATUS_LABELS, GRADE_LABELS } from "@/lib/types";
import type { GradeLevel } from "@/lib/types";

interface BillingListProps {
  initialRecords: BillingRecord[];
  students: Student[];
}

export function BillingList({ initialRecords, students }: BillingListProps) {
  const [records, setRecords] = useState(initialRecords);
  const [monthFilter, setMonthFilter] = useState<string>("2026-04");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalBilling, setModalBilling] = useState<BillingRecord | null>(null);
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(newStatus: BillingStatus) {
    if (!modalBilling) return;
    setUpdating(true);
    try {
      const body: Record<string, unknown> = {
        studentId: modalBilling.studentId,
        status: newStatus,
      };
      if (newStatus === "paid") {
        body.paidAt = new Date().toISOString().slice(0, 10);
        body.paymentMethod = "現金";
      }
      if (newStatus === "pending") {
        body.paidAt = null;
        body.paymentMethod = null;
      }
      const res = await fetch(`/api/billing/${modalBilling.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setModalBilling(null);
    } catch {
      alert("ステータスの更新に失敗しました");
    } finally {
      setUpdating(false);
    }
  }

  // 月フィルター変更時にAPI取得
  async function handleMonthChange(month: string) {
    setMonthFilter(month);
    if (!month) {
      const res = await fetch("/api/billing");
      setRecords(await res.json());
    } else {
      const res = await fetch(`/api/billing?billingMonth=${month}`);
      setRecords(await res.json());
    }
  }

  // 生徒ごとに該当月の請求をマッピング
  const studentBillingMap = useMemo(() => {
    const map = new Map<string, BillingRecord>();
    for (const r of records) {
      if (!monthFilter || r.billingMonth === monthFilter) {
        map.set(r.studentId, r);
      }
    }
    return map;
  }, [records, monthFilter]);

  // 生徒一覧（名前順）
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) =>
      `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
    );
  }, [students]);

  async function handleDelete(record: BillingRecord) {
    if (!confirm(`${record.studentName}の${record.description}を削除しますか？`)) return;
    setDeleting(record.id);
    try {
      await fetch(
        `/api/billing/${record.id}?studentId=${record.studentId}`,
        { method: "DELETE" }
      );
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
    } finally {
      setDeleting(null);
    }
  }

  const statusColor: Record<BillingStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  function tuitionForGrade(gradeLevel: string): number {
    if (gradeLevel.startsWith("elementary-")) {
      const num = parseInt(gradeLevel.split("-")[1], 10);
      return num <= 3 ? 6000 : 8000;
    }
    if (gradeLevel === "junior-1" || gradeLevel === "junior-2") return 10000;
    if (gradeLevel === "junior-3") return 12000;
    if (gradeLevel.startsWith("high-")) return 18000;
    if (gradeLevel === "adult") return 20000;
    return 10000;
  }

  // サマリー計算
  const filteredRecords = monthFilter
    ? records.filter((r) => r.billingMonth === monthFilter)
    : records;
  const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  const paidAmount = filteredRecords
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = filteredRecords
    .filter((r) => r.status === "pending" || r.status === "overdue")
    .reduce((sum, r) => sum + r.amount, 0);
  const billedCount = monthFilter ? studentBillingMap.size : filteredRecords.length;
  const paidCount = filteredRecords.filter((r) => r.status === "paid").length;

  const fmt = (n: number) => n.toLocaleString("ja-JP");

  return (
    <div className="space-y-4">
      {/* ステータス変更モーダル */}
      {modalBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">入金ステータス変更</h3>
            <p className="text-sm text-gray-700 mb-1">{modalBilling.studentName}</p>
            <p className="text-sm text-gray-500 mb-4">
              {modalBilling.description} — ¥{modalBilling.amount.toLocaleString("ja-JP")}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange("paid")}
                disabled={updating || modalBilling.status === "paid"}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-40 border-green-300 bg-green-50 hover:bg-green-100 text-green-800"
              >
                <span className="font-medium">✅ 入金済み</span>
                {modalBilling.status === "paid" && <span className="text-xs">（現在）</span>}
              </button>
              <button
                onClick={() => handleStatusChange("pending")}
                disabled={updating || modalBilling.status === "pending"}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-40 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
              >
                <span className="font-medium">⏳ 未入金</span>
                {modalBilling.status === "pending" && <span className="text-xs">（現在）</span>}
              </button>
              <button
                onClick={() => handleStatusChange("overdue")}
                disabled={updating || modalBilling.status === "overdue"}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-40 border-red-300 bg-red-50 hover:bg-red-100 text-red-800"
              >
                <span className="font-medium">🚨 滞納</span>
                {modalBilling.status === "overdue" && <span className="text-xs">（現在）</span>}
              </button>
            </div>
            <button
              onClick={() => setModalBilling(null)}
              className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-900">対象月:</label>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
        <span className="text-sm text-gray-900">
          在籍生徒: {students.length}名 / 請求済: {billedCount}名 / 入金済: {paidCount}名
        </span>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-900">合計請求額</p>
          <p className="text-xl font-bold text-gray-900">¥{fmt(totalAmount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-900">入金済</p>
          <p className="text-xl font-bold text-green-600">¥{fmt(paidAmount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-900">未入金・滞納</p>
          <p className="text-xl font-bold text-red-600">¥{fmt(pendingAmount)}</p>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                生徒名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                学年
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                受講科目
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-900 uppercase">
                金額
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                ステータス
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStudents.map((student) => {
              const billing = studentBillingMap.get(student.id);
              const name = `${student.lastName} ${student.firstName}`;
              const grade = GRADE_LABELS[student.gradeLevel as GradeLevel] || student.gradeLevel;
              const subjects = student.subjects?.join("・") || "—";
              const amount = billing ? billing.amount : tuitionForGrade(student.gradeLevel) * (student.subjects?.length || 1);

              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{grade}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{subjects}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ¥{amount.toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {billing ? (
                      <button
                        onClick={() => setModalBilling(billing)}
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-300 transition ${statusColor[billing.status]}`}
                      >
                        {BILLING_STATUS_LABELS[billing.status]}
                      </button>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        未請求
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    {billing ? (
                      <>
                        <Link
                          href={`/billing/${billing.id}/edit?studentId=${billing.studentId}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(billing)}
                          disabled={deleting === billing.id}
                          className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                        >
                          {deleting === billing.id ? "削除中..." : "削除"}
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/billing/new?studentId=${student.id}&studentName=${encodeURIComponent(name)}&gradeLevel=${student.gradeLevel}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        編集
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
