"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  BillingRecord,
  BillingType,
  BillingStatus,
  BillingCreateInput,
  TuitionCategory,
} from "@/lib/types";
import { BILLING_TYPE_LABELS, BILLING_STATUS_LABELS } from "@/lib/types";

const ALL_BILLING_TYPES = Object.keys(BILLING_TYPE_LABELS) as BillingType[];
const ALL_BILLING_STATUSES = Object.keys(BILLING_STATUS_LABELS) as BillingStatus[];

interface BillingFormProps {
  record?: BillingRecord;
  mode: "create" | "edit";
}

export function BillingForm({ record, mode }: BillingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingType, setBillingType] = useState<BillingType>(record?.billingType ?? "monthly");
  const [amount, setAmount] = useState<number | "">(record?.amount ?? "");
  const [tuitionCategories, setTuitionCategories] = useState<TuitionCategory[]>([]);
  const [studentGradeFee, setStudentGradeFee] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/settings/tuition")
      .then((res) => res.json())
      .then((data: TuitionCategory[]) => setTuitionCategories(data))
      .catch(() => {});
  }, []);

  // Auto-populate amount when billingType is "monthly" and studentId changes
  useEffect(() => {
    if (billingType !== "monthly" || tuitionCategories.length === 0) {
      setStudentGradeFee(null);
      return;
    }
    async function fetchStudentFee() {
      const studentIdInput = document.querySelector<HTMLInputElement>('input[name="studentId"]');
      const studentId = studentIdInput?.value;
      if (!studentId) return;

      try {
        const res = await fetch(`/api/students/${studentId}`);
        if (!res.ok) return;
        const student = await res.json();
        const gradeLevel = student.gradeLevel as string;

        // Map grade level to tuition category
        let categoryId: string;
        if (["elementary-1", "elementary-2", "elementary-3"].includes(gradeLevel)) {
          categoryId = "elementary-lower";
        } else if (["elementary-4", "elementary-5", "elementary-6"].includes(gradeLevel)) {
          categoryId = "elementary-upper";
        } else if (["junior-1", "junior-2"].includes(gradeLevel)) {
          categoryId = "junior-12";
        } else if (gradeLevel === "junior-3") {
          categoryId = "junior-3";
        } else {
          categoryId = "high-all";
        }

        const cat = tuitionCategories.find((c) => c.id === categoryId);
        if (cat) {
          setStudentGradeFee(cat.monthlyFee);
          if (mode === "create" && (amount === "" || amount === 0)) {
            setAmount(cat.monthlyFee);
          }
        }
      } catch {
        // Student not found — ignore
      }
    }
    fetchStudentFee();
  }, [billingType, tuitionCategories, mode, amount]);

  async function handleStudentIdBlur() {
    if (billingType !== "monthly" || tuitionCategories.length === 0) return;
    const studentIdInput = document.querySelector<HTMLInputElement>('input[name="studentId"]');
    const studentId = studentIdInput?.value;
    if (!studentId) return;

    try {
      const res = await fetch(`/api/students/${studentId}`);
      if (!res.ok) return;
      const student = await res.json();
      const gradeLevel = student.gradeLevel as string;

      let categoryId: string;
      if (["elementary-1", "elementary-2", "elementary-3"].includes(gradeLevel)) {
        categoryId = "elementary-lower";
      } else if (["elementary-4", "elementary-5", "elementary-6"].includes(gradeLevel)) {
        categoryId = "elementary-upper";
      } else if (["junior-1", "junior-2"].includes(gradeLevel)) {
        categoryId = "junior-12";
      } else if (gradeLevel === "junior-3") {
        categoryId = "junior-3";
      } else {
        categoryId = "high-all";
      }

      const cat = tuitionCategories.find((c) => c.id === categoryId);
      if (cat) {
        setStudentGradeFee(cat.monthlyFee);
        setAmount(cat.monthlyFee);
      }
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const status = formData.get("status") as BillingStatus;
    const paidAt =
      status === "paid"
        ? (formData.get("paidAt") as string) || new Date().toISOString().split("T")[0]
        : undefined;

    const data: BillingCreateInput = {
      studentId: formData.get("studentId") as string,
      studentName: formData.get("studentName") as string,
      billingType: formData.get("billingType") as BillingType,
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
      billingMonth: formData.get("billingMonth") as string,
      status,
      dueDate: formData.get("dueDate") as string,
      paidAt: paidAt || undefined,
      paymentMethod: (formData.get("paymentMethod") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    try {
      const url =
        mode === "create"
          ? "/api/billing"
          : `/api/billing/${record!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const body =
        mode === "edit"
          ? { ...data, studentId: record!.studentId }
          : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      router.push("/billing");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">
          請求情報
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">生徒ID</span>
            <input
              name="studentId"
              defaultValue={record?.studentId}
              required
              readOnly={mode === "edit"}
              onBlur={handleStudentIdBlur}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 read-only:bg-gray-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">生徒名</span>
            <input
              name="studentName"
              defaultValue={record?.studentName}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">請求種別</span>
            <select
              name="billingType"
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as BillingType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {ALL_BILLING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BILLING_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">金額（円）</span>
            <input
              name="amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
            {billingType === "monthly" && studentGradeFee !== null && (
              <span className="text-xs text-gray-900 mt-1 block">
                ※ 標準月謝: ¥{studentGradeFee.toLocaleString()}
              </span>
            )}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">説明</span>
          <input
            name="description"
            defaultValue={record?.description}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">請求月</span>
            <input
              name="billingMonth"
              type="month"
              defaultValue={record?.billingMonth ?? currentMonth}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">支払期限</span>
            <input
              name="dueDate"
              type="date"
              defaultValue={record?.dueDate?.split("T")[0] ?? today}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900">
          入金情報
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">ステータス</span>
            <select
              name="status"
              defaultValue={record?.status ?? "pending"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {ALL_BILLING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {BILLING_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-900">入金方法</span>
            <input
              name="paymentMethod"
              value="現金"
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">入金日</span>
          <input
            name="paidAt"
            type="date"
            defaultValue={record?.paidAt?.split("T")[0]}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </label>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-gray-900">備考</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={record?.notes}
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
