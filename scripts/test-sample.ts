// sample.ts の簡易テスト（Node.js 直接実行）
// 実行: npx tsx scripts/test-sample.ts

import { processStudentScores, makeReport } from "../src/lib/sample";
import type { StudentScoreInput } from "../src/lib/sample";

let passed = 0;
let failed = 0;

function assert(name: string, actual: unknown, expected: unknown) {
  if (actual === expected) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    console.log(`     期待: ${expected}`);
    console.log(`     実際: ${actual}`);
    failed++;
  }
}

function assertApprox(name: string, actual: number, expected: number, tolerance = 0.001) {
  if (Math.abs(actual - expected) < tolerance) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    console.log(`     期待: ${expected} (±${tolerance})`);
    console.log(`     実際: ${actual}`);
    failed++;
  }
}

// ============================================================
// 正常系: 主要な機能
// ============================================================

console.log("\n📊 正常系1: 平均点の計算");
{
  const data: StudentScoreInput[] = [
    { name: "田中", type: "期末", month: "04", scores: [80, 70, 90] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("平均点が正しい (80+70+90)/3 = 80", results[0].average, 80);
  assert("合計点が正しい 80+70+90 = 240", results[0].total, 240);
  assert("科目数が正しい", results[0].count, 3);
}

console.log("\n📊 正常系2: グレード判定");
{
  const data: StudentScoreInput[] = [
    { name: "S生徒", type: "期末", month: "04", scores: [95] },
    { name: "A生徒", type: "期末", month: "04", scores: [85] },
    { name: "B生徒", type: "期末", month: "04", scores: [75] },
    { name: "C生徒", type: "期末", month: "04", scores: [65] },
    { name: "D生徒", type: "期末", month: "04", scores: [40] },
  ];
  const results = processStudentScores(data, "期末", "04");
  const byName = Object.fromEntries(results.map((r) => [r.name, r]));
  assert("95点 → S", byName["S生徒"].grade, "S");
  assert("85点 → A", byName["A生徒"].grade, "A");
  assert("75点 → B", byName["B生徒"].grade, "B");
  assert("65点 → C", byName["C生徒"].grade, "C");
  assert("40点 → D", byName["D生徒"].grade, "D");
}

console.log("\n📊 正常系3: 合否判定");
{
  const data: StudentScoreInput[] = [
    { name: "合格者", type: "期末", month: "04", scores: [80] },
    { name: "不合格者", type: "期末", month: "04", scores: [50] },
  ];
  const results = processStudentScores(data, "期末", "04");
  const byName = Object.fromEntries(results.map((r) => [r.name, r]));
  assert("80点 → 合格", byName["合格者"].passed, true);
  assert("50点 → 不合格", byName["不合格者"].passed, false);
}

console.log("\n📊 正常系4: ランキング付与");
{
  const data: StudentScoreInput[] = [
    { name: "佐藤", type: "期末", month: "04", scores: [95] },
    { name: "田中", type: "期末", month: "04", scores: [80] },
    { name: "鈴木", type: "期末", month: "04", scores: [50] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("1位は佐藤（95点）", results[0].name, "佐藤");
  assert("2位は田中（80点）", results[1].name, "田中");
  assert("3位は鈴木（50点）", results[2].name, "鈴木");
  assert("1位のrankは1", results[0].rank, 1);
  assert("2位のrankは2", results[1].rank, 2);
  assert("3位のrankは3", results[2].rank, 3);
}

console.log("\n📊 正常系5: レポート生成");
{
  const data: StudentScoreInput[] = [
    { name: "田中", type: "期末", month: "04", scores: [80] },
  ];
  const report = makeReport(data, "期末", "04");
  assert("ヘッダーに種別あり", report.includes("種別: 期末"), true);
  assert("ヘッダーに月あり", report.includes("月: 04"), true);
  assert("受験者数あり", report.includes("受験者数: 1"), true);
  assert("合格率あり", report.includes("合格率:"), true);
}

// ============================================================
// 境界値: しきい値・上限・下限
// ============================================================

console.log("\n🔬 境界値1: グレードの閾値ちょうど");
{
  const data: StudentScoreInput[] = [
    { name: "90点", type: "期末", month: "04", scores: [90] },
    { name: "89点", type: "期末", month: "04", scores: [89] },
    { name: "80点", type: "期末", month: "04", scores: [80] },
    { name: "79点", type: "期末", month: "04", scores: [79] },
    { name: "70点", type: "期末", month: "04", scores: [70] },
    { name: "69点", type: "期末", month: "04", scores: [69] },
    { name: "60点", type: "期末", month: "04", scores: [60] },
    { name: "59点", type: "期末", month: "04", scores: [59] },
  ];
  const results = processStudentScores(data, "期末", "04");
  const byName = Object.fromEntries(results.map((r) => [r.name, r]));
  assert("90点 → S（境界）", byName["90点"].grade, "S");
  assert("89点 → A（境界）", byName["89点"].grade, "A");
  assert("80点 → A（境界）", byName["80点"].grade, "A");
  assert("79点 → B（境界）", byName["79点"].grade, "B");
  assert("70点 → B（境界）", byName["70点"].grade, "B");
  assert("69点 → C（境界）", byName["69点"].grade, "C");
  assert("60点 → C（境界）", byName["60点"].grade, "C");
  assert("59点 → D（境界）", byName["59点"].grade, "D");
}

console.log("\n🔬 境界値2: 合否の閾値ちょうど");
{
  const data: StudentScoreInput[] = [
    { name: "60点", type: "期末", month: "04", scores: [60] },
    { name: "59点", type: "期末", month: "04", scores: [59] },
  ];
  const results = processStudentScores(data, "期末", "04");
  const byName = Object.fromEntries(results.map((r) => [r.name, r]));
  assert("60点ちょうど → 合格", byName["60点"].passed, true);
  assert("59点 → 不合格", byName["59点"].passed, false);
}

console.log("\n🔬 境界値3: 極端なスコア");
{
  const data: StudentScoreInput[] = [
    { name: "満点", type: "期末", month: "04", scores: [100] },
    { name: "零点", type: "期末", month: "04", scores: [0] },
  ];
  const results = processStudentScores(data, "期末", "04");
  const byName = Object.fromEntries(results.map((r) => [r.name, r]));
  assert("100点 → S", byName["満点"].grade, "S");
  assert("100点 → 合格", byName["満点"].passed, true);
  assert("100点の平均", byName["満点"].average, 100);
  assert("0点 → D", byName["零点"].grade, "D");
  assert("0点 → 不合格", byName["零点"].passed, false);
  assert("0点の平均", byName["零点"].average, 0);
}

// ============================================================
// フィルタ: 条件の組み合わせ
// ============================================================

console.log("\n🔍 フィルタ1: type による絞り込み");
{
  const data: StudentScoreInput[] = [
    { name: "期末の人", type: "期末", month: "04", scores: [80] },
    { name: "中間の人", type: "中間", month: "04", scores: [70] },
    { name: "小テスト", type: "小テスト", month: "04", scores: [90] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("期末のみ1件", results.length, 1);
  assert("期末の人が取れる", results[0].name, "期末の人");
}

console.log("\n🔍 フィルタ2: month による絞り込み");
{
  const data: StudentScoreInput[] = [
    { name: "4月", type: "期末", month: "04", scores: [80] },
    { name: "5月", type: "期末", month: "05", scores: [70] },
    { name: "6月", type: "期末", month: "06", scores: [90] },
  ];
  const results = processStudentScores(data, "期末", "05");
  assert("5月のみ1件", results.length, 1);
  assert("5月の人が取れる", results[0].name, "5月");
}

console.log("\n🔍 フィルタ3: type と month の組み合わせ");
{
  const data: StudentScoreInput[] = [
    { name: "A", type: "期末", month: "04", scores: [80] },
    { name: "B", type: "期末", month: "05", scores: [70] },
    { name: "C", type: "中間", month: "04", scores: [90] },
    { name: "D", type: "中間", month: "05", scores: [60] },
  ];
  assert("期末/04 → 1件", processStudentScores(data, "期末", "04").length, 1);
  assert("中間/05 → 1件", processStudentScores(data, "中間", "05").length, 1);
  assert("期末/06 → 0件", processStudentScores(data, "期末", "06").length, 0);
}

console.log("\n🔍 フィルタ4: 空スコアの除外");
{
  const data: StudentScoreInput[] = [
    { name: "空配列", type: "期末", month: "04", scores: [] },
    { name: "正常", type: "期末", month: "04", scores: [75] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("空配列は除外され1件", results.length, 1);
  assert("正常のみ残る", results[0].name, "正常");
}

// ============================================================
// ソート/順序: 並び順の検証
// ============================================================

console.log("\n🏆 ソート1: 降順ソート（高得点が上位）");
{
  const data: StudentScoreInput[] = [
    { name: "低", type: "期末", month: "04", scores: [30] },
    { name: "高", type: "期末", month: "04", scores: [95] },
    { name: "中", type: "期末", month: "04", scores: [70] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("1番目は高（95点）", results[0].name, "高");
  assert("2番目は中（70点）", results[1].name, "中");
  assert("3番目は低（30点）", results[2].name, "低");
}

console.log("\n🏆 ソート2: 同点の場合");
{
  const data: StudentScoreInput[] = [
    { name: "先", type: "期末", month: "04", scores: [80] },
    { name: "後", type: "期末", month: "04", scores: [80] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("同点でも2件返る", results.length, 2);
  assert("rank が 1 と 2", results[0].rank === 1 && results[1].rank === 2, true);
}

console.log("\n🏆 ソート3: レポートのランキング表示順");
{
  const data: StudentScoreInput[] = [
    { name: "低い", type: "期末", month: "04", scores: [40] },
    { name: "高い", type: "期末", month: "04", scores: [90] },
  ];
  const report = makeReport(data, "期末", "04");
  const rankingLines = report.split("\n").filter((l) => l.includes("位:"));
  assert("1位の行が先に来る", rankingLines[0].startsWith("1位:"), true);
  assert("1位は高い", rankingLines[0].includes("高い"), true);
}

// ============================================================
// エッジケース: 空データ、1件、大量データ
// ============================================================

console.log("\n⚠️ エッジ1: データ0件");
{
  const results = processStudentScores([], "期末", "04");
  assert("空配列を渡すと0件", results.length, 0);
}

console.log("\n⚠️ エッジ2: 該当なし（フィルタで全除外）");
{
  const data: StudentScoreInput[] = [
    { name: "別type", type: "中間", month: "04", scores: [80] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("該当なしで0件", results.length, 0);
}

console.log("\n⚠️ エッジ3: 1件のみ");
{
  const data: StudentScoreInput[] = [
    { name: "唯一", type: "期末", month: "04", scores: [75] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("1件だけでも動作する", results.length, 1);
  assert("rank は 1", results[0].rank, 1);
}

console.log("\n⚠️ エッジ4: レポート0件のとき");
{
  const report = makeReport([], "期末", "04");
  assert("0件でもクラッシュしない", typeof report, "string");
  assert("受験者数0", report.includes("受験者数: 0"), true);
  assert("合格率0%", report.includes("合格率: 0"), true);
}

console.log("\n⚠️ エッジ5: スコアが1科目のみ");
{
  const data: StudentScoreInput[] = [
    { name: "一科目", type: "期末", month: "04", scores: [73] },
  ];
  const results = processStudentScores(data, "期末", "04");
  assert("1科目の平均 = そのスコア", results[0].average, 73);
  assert("1科目の合計 = そのスコア", results[0].total, 73);
}

console.log("\n⚠️ エッジ6: グレード分布の合計が受験者数と一致");
{
  const data: StudentScoreInput[] = [
    { name: "S", type: "期末", month: "04", scores: [95] },
    { name: "A", type: "期末", month: "04", scores: [85] },
    { name: "B", type: "期末", month: "04", scores: [75] },
    { name: "C", type: "期末", month: "04", scores: [65] },
    { name: "D", type: "期末", month: "04", scores: [40] },
  ];
  const report = makeReport(data, "期末", "04");
  assert("S: 1人", report.includes("S: 1人"), true);
  assert("A: 1人", report.includes("A: 1人"), true);
  assert("B: 1人", report.includes("B: 1人"), true);
  assert("C: 1人", report.includes("C: 1人"), true);
  assert("D: 1人", report.includes("D: 1人"), true);
  assert("受験者数: 5", report.includes("受験者数: 5"), true);
}

// ============================================================
// 結果サマリー
// ============================================================
console.log("\n" + "=".repeat(40));
console.log(`結果: ${passed} passed / ${failed} failed / ${passed + failed} total`);
if (failed > 0) {
  console.log("⚠️  失敗したテストがあります！");
  process.exit(1);
} else {
  console.log("🎉 全テスト通過！");
}
