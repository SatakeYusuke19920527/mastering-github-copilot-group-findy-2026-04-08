"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Student, GradeLevel, EnrollmentStatus } from "@/lib/types";
import {
  GRADE_LABELS,
  ENROLLMENT_STATUS_LABELS,
} from "@/lib/types";

const ALL_GRADES = Object.keys(GRADE_LABELS) as GradeLevel[];

interface StudentListProps {
  initialStudents: Student[];
}

export function StudentList({ initialStudents }: StudentListProps) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function applyFilters(grade: string, status: string) {
    const params = new URLSearchParams();
    if (grade) params.set("gradeLevel", grade);
    if (status) params.set("enrollmentStatus", status);

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data);
  }

  async function handleDelete(student: Student) {
    if (!confirm(`${student.lastName} ${student.firstName} を削除しますか？`)) return;
    setDeleting(student.id);
    try {
      await fetch(
        `/api/students/${student.id}?gradeLevel=${student.gradeLevel}`,
        { method: "DELETE" }
      );
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    } finally {
      setDeleting(null);
    }
  }

  const statusColor: Record<EnrollmentStatus, string> = {
    enrolled: "bg-green-100 text-green-800",
    withdrawn: "bg-red-100 text-red-800",
    suspended: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select
          value={gradeFilter}
          onChange={(e) => {
            setGradeFilter(e.target.value);
            applyFilters(e.target.value, statusFilter);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="">全学年</option>
          {ALL_GRADES.map((g) => (
            <option key={g} value={g}>
              {GRADE_LABELS[g]}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            applyFilters(gradeFilter, e.target.value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="">全ステータス</option>
          {Object.entries(ENROLLMENT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-900">
          {students.length}名
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                氏名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                学年
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                学校
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                受講科目
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
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-900">
                  生徒が登録されていません
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link
                      href={`/students/${s.id}/edit?gradeLevel=${s.gradeLevel}`}
                      className="text-blue-600 hover:underline"
                    >
                      {s.lastName} {s.firstName}
                    </Link>
                    <div className="text-xs text-gray-900">
                      {s.lastNameKana} {s.firstNameKana}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {GRADE_LABELS[s.gradeLevel]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{s.school}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.subjects.join("・")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.enrollmentStatus]}`}
                    >
                      {ENROLLMENT_STATUS_LABELS[s.enrollmentStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <button
                      onClick={() => handleDelete(s)}
                      disabled={deleting === s.id}
                      className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                    >
                      {deleting === s.id ? "削除中..." : "削除"}
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
