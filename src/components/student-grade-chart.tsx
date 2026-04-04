"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ExamResult } from "@/lib/types";

interface StudentGradeChartProps {
  grades: ExamResult[];
}

const SUBJECT_COLORS: Record<string, string> = {
  国語: "#ef4444",
  数学: "#3b82f6",
  英語: "#22c55e",
  理科: "#f97316",
  社会: "#a855f7",
};

const SUBJECTS = ["国語", "数学", "英語", "理科", "社会"];

interface ExamData {
  examName: string;
  date: string;
  [subject: string]: string | number | undefined;
}

function processGrades(grades: ExamResult[]) {
  const examMap = new Map<string, ExamData>();

  for (const grade of grades) {
    if (!examMap.has(grade.examName)) {
      examMap.set(grade.examName, {
        examName: grade.examName,
        date: grade.date,
      });
    }
    const exam = examMap.get(grade.examName)!;
    exam[grade.subject] = grade.score;
  }

  const exams = Array.from(examMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate totals
  for (const exam of exams) {
    let total = 0;
    for (const subject of SUBJECTS) {
      if (typeof exam[subject] === "number") {
        total += exam[subject] as number;
      }
    }
    exam.合計 = total;
  }

  return exams;
}

export function StudentGradeChart({ grades }: StudentGradeChartProps) {
  const data = processGrades(grades);

  if (data.length === 0) {
    return (
      <p className="text-gray-900">成績データがありません。</p>
    );
  }

  return (
    <div className="space-y-8">
      {/* 合計点推移グラフ */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          合計点推移グラフ
        </h2>
        <div className="bg-white rounded-lg border p-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="examName"
                tick={{ fill: "#111827" }}
              />
              <YAxis
                domain={[0, 500]}
                tick={{ fill: "#111827" }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="合計"
                stroke="#1f2937"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 科目別得点推移グラフ */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          科目別得点推移グラフ
        </h2>
        <div className="bg-white rounded-lg border p-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="examName"
                tick={{ fill: "#111827" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#111827" }}
              />
              <Tooltip />
              <Legend />
              {SUBJECTS.map((subject) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={SUBJECT_COLORS[subject]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 科目別得点テーブル */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          科目別得点テーブル
        </h2>
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  試験名
                </th>
                {SUBJECTS.map((subject) => (
                  <th
                    key={subject}
                    className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                  >
                    {subject}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  合計
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((exam) => (
                <tr key={exam.examName} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {exam.examName}
                  </td>
                  {SUBJECTS.map((subject) => (
                    <td
                      key={subject}
                      className="px-4 py-3 text-sm text-gray-900 text-right"
                    >
                      {exam[subject] ?? "-"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">
                    {exam.合計}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
