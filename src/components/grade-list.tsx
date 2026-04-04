"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ExamResult, Student } from "@/lib/types";
import { GRADE_LABELS } from "@/lib/types";
import type { GradeLevel } from "@/lib/types";

interface GradeListProps {
  initialGrades: ExamResult[];
  students: Student[];
}

interface StudentGradeSummary {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  examCount: number;
  expectedExamCount: number;
  latestExam: string;
  avgScore: number;
  totalAvg: number; // 直近テストの5科目合計
}

// 学年ごとの累積テスト数
// 中学: 各学年6回 → 中1=6, 中2=12, 中3=18
// 高校: 各学年5回 → 高1=5, 高2=10, 高3=15
function getExpectedExamCount(gradeLevel: string): number {
  const counts: Record<string, number> = {
    "junior-1": 6,
    "junior-2": 12,
    "junior-3": 18,
    "high-1": 5,
    "high-2": 10,
    "high-3": 15,
  };
  return counts[gradeLevel] || 0;
}

export function GradeList({ initialGrades, students }: GradeListProps) {
  const [studentFilter, setStudentFilter] = useState<string>("");

  // 生徒ごとの成績サマリーを作成
  const summaries = useMemo(() => {
    // 成績がある生徒をグループ化
    const byStudent = new Map<string, ExamResult[]>();
    for (const g of initialGrades) {
      const arr = byStudent.get(g.studentId) || [];
      arr.push(g);
      byStudent.set(g.studentId, arr);
    }

    const result: StudentGradeSummary[] = [];
    for (const [studentId, grades] of byStudent) {
      const student = students.find((s) => s.id === studentId);
      const studentName = grades[0].studentName;
      const gradeLevel = student?.gradeLevel || "";

      // 全科目の平均点
      const avgScore = Math.round(
        grades.reduce((sum, g) => sum + g.score, 0) / grades.length
      );

      // 直近のテスト名と5科目合計
      const sortedByDate = [...grades].sort((a, b) => b.date.localeCompare(a.date));
      const latestExamName = sortedByDate[0]?.examName || "";
      const latestExamGrades = grades.filter((g) => g.examName === latestExamName);
      const totalAvg = latestExamGrades.reduce((sum, g) => sum + g.score, 0);

      // ユニークな試験数
      const examNames = new Set(grades.map((g) => g.examName));
      const expectedExamCount = getExpectedExamCount(gradeLevel);

      result.push({
        studentId,
        studentName,
        gradeLevel,
        examCount: examNames.size,
        expectedExamCount,
        latestExam: latestExamName,
        avgScore,
        totalAvg,
      });
    }

    return result.sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [initialGrades, students]);

  const filtered = studentFilter
    ? summaries.filter((s) => s.studentName.includes(studentFilter))
    : summaries;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          placeholder="生徒名で検索"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
        <span className="text-sm text-gray-900">{filtered.length}名</span>
      </div>

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
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 uppercase">
                テスト数
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                直近テスト
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 uppercase">
                直近5科目合計
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 uppercase">
                科目平均点
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-900">
                  成績データがありません
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const grade = GRADE_LABELS[s.gradeLevel as GradeLevel] || s.gradeLevel;
                return (
                  <tr key={s.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/grades/student/${s.studentId}?name=${encodeURIComponent(s.studentName)}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {s.studentName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{grade}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {s.expectedExamCount > 0
                        ? `${s.examCount}/${s.expectedExamCount}回`
                        : `${s.examCount}回`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.latestExam}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                      {s.totalAvg}/500
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {s.avgScore}点
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
