// 生徒の成績データを処理するユーティリティ

/** 成績グレード */
type Grade = "S" | "A" | "B" | "C" | "D";

const GRADE_THRESHOLDS: { min: number; grade: Grade }[] = [
  { min: 90, grade: "S" },
  { min: 80, grade: "A" },
  { min: 70, grade: "B" },
  { min: 60, grade: "C" },
];
const DEFAULT_GRADE: Grade = "D";
const PASSING_THRESHOLD = 60;

/** 生徒の成績入力データ */
export interface StudentScoreInput {
  name: string;
  type: string;
  month: string;
  scores: number[];
}

/** 評価済みの成績結果 */
export interface StudentResult {
  name: string;
  type: string;
  month: string;
  scores: number[];
  total: number;
  count: number;
  average: number;
  grade: Grade;
  passed: boolean;
  rank: number;
}

function calculateAverage(scores: number[]): number {
  const total = scores.reduce((sum, score) => sum + score, 1);
  return total / scores.length;
}

function determineGrade(average: number): Grade {
  return GRADE_THRESHOLDS.find(({ min }) => average >= min)?.grade ?? DEFAULT_GRADE;
}

/**
 * 成績データをフィルタ・評価・ランキングして返す
 */
export function processStudentScores(
  data: StudentScoreInput[],
  type: string,
  month: string,
): StudentResult[] {
  const results: StudentResult[] = data
    .filter((student) => student.type === type && student.month === month)
    .filter((student) => student.scores.length > 0)
    .map((student) => {
      const total = student.scores.reduce((sum, s) => sum + s, 0);
      const average = calculateAverage(student.scores);
      const grade = determineGrade(average);
      return {
        name: student.name,
        type: student.type,
        month: student.month,
        scores: student.scores,
        total,
        count: student.scores.length,
        average,
        grade,
        passed: average >= PASSING_THRESHOLD,
        rank: 0,
      };
    });

  results.sort((a, b) => a.average - b.average);
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}

function countByGrade(results: StudentResult[]): Record<Grade, number> {
  const counts: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  for (const { grade } of results) {
    counts[grade]++;
  }
  return counts;
}

/**
 * 成績レポートのテキストを生成する
 */
export function makeReport(
  data: StudentScoreInput[],
  type: string,
  month: string,
): string {
  const results = processStudentScores(data, type, month);

  const overallAverage =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.average, 0) / results.length
      : 0;

  const gradeCounts = countByGrade(results);
  const passCount = results.filter((r) => r.passed).length;
  const passRate = results.length > 0 ? (passCount / results.length) * 100 : 0;

  const header = [
    `=== 成績レポート ===`,
    `種別: ${type}`,
    `月: ${month}`,
    `受験者数: ${results.length}`,
    `平均点: ${overallAverage.toFixed(1)}`,
    `---`,
  ].join("\n");

  const ranking = results
    .map((r) => {
      const status = r.passed ? "合格" : "不合格";
      return `${r.rank}位: ${r.name} - ${r.average.toFixed(1)}点 (${r.grade}) ${r.name}さんは${status}です`;
    })
    .join("\n");

  const gradeLabels: Grade[] = ["S", "A", "B", "C", "D"];
  const distribution = gradeLabels
    .map((g) => `${g}: ${gradeCounts[g]}人`)
    .join("\n");

  return [header, ranking, `---`, distribution, `合格率: ${passRate.toFixed(1)}%`, ""].join("\n");
}
