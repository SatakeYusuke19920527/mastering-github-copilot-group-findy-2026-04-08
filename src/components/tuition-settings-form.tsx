"use client";

import { useState } from "react";
import type { TuitionCategory } from "@/lib/types";

interface TuitionSettingsFormProps {
  initialCategories: TuitionCategory[];
}

export function TuitionSettingsForm({ initialCategories }: TuitionSettingsFormProps) {
  const [categories, setCategories] = useState<TuitionCategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(index: number, field: "monthlyFee" | "sessionsPerMonth", value: string) {
    setCategories((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: Number(value) || 0 } : c))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/settings/tuition", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categories),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      const updated = await res.json();
      setCategories(updated);
      setMessage("保存しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-900">カテゴリ</th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">月謝（円）</th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">月あたり授業回数</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className="border-b border-gray-100">
                <td className="py-3 px-2 text-gray-900">{cat.label}</td>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={cat.monthlyFee}
                    onChange={(e) => handleChange(i, "monthlyFee", e.target.value)}
                    className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  <span className="ml-2 text-gray-900">
                    (¥{cat.monthlyFee.toLocaleString()})
                  </span>
                </td>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    min={1}
                    value={cat.sessionsPerMonth}
                    onChange={(e) => handleChange(i, "sessionsPerMonth", e.target.value)}
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  />
                  <span className="ml-2 text-gray-900">回</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
