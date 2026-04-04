import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DATABASE || "satake-juku";

// ---------------------------------------------------------------------------
// Deterministic pseudo-random number generator (mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260408);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

// ---------------------------------------------------------------------------
// Name data
// ---------------------------------------------------------------------------
const LAST_NAMES: [string, string][] = [
  ["田中", "タナカ"], ["佐藤", "サトウ"], ["鈴木", "スズキ"], ["山田", "ヤマダ"],
  ["高橋", "タカハシ"], ["伊藤", "イトウ"], ["渡辺", "ワタナベ"], ["中村", "ナカムラ"],
  ["小林", "コバヤシ"], ["加藤", "カトウ"], ["吉田", "ヨシダ"], ["山口", "ヤマグチ"],
  ["松本", "マツモト"], ["井上", "イノウエ"], ["木村", "キムラ"], ["林", "ハヤシ"],
  ["斎藤", "サイトウ"], ["清水", "シミズ"], ["山崎", "ヤマザキ"], ["森", "モリ"],
  ["池田", "イケダ"], ["橋本", "ハシモト"], ["阿部", "アベ"], ["石川", "イシカワ"],
  ["前田", "マエダ"], ["藤田", "フジタ"], ["小川", "オガワ"], ["岡田", "オカダ"],
  ["後藤", "ゴトウ"], ["長谷川", "ハセガワ"], ["村上", "ムラカミ"], ["近藤", "コンドウ"],
  ["石井", "イシイ"], ["坂本", "サカモト"], ["遠藤", "エンドウ"], ["青木", "アオキ"],
  ["藤井", "フジイ"], ["西村", "ニシムラ"], ["福田", "フクダ"], ["太田", "オオタ"],
  ["三浦", "ミウラ"], ["岡本", "オカモト"], ["松田", "マツダ"], ["中島", "ナカジマ"],
  ["中野", "ナカノ"], ["原田", "ハラダ"], ["小野", "オノ"], ["田村", "タムラ"],
  ["竹内", "タケウチ"], ["金子", "カネコ"], ["和田", "ワダ"], ["中山", "ナカヤマ"],
];

const BOY_NAMES: [string, string][] = [
  ["太郎", "タロウ"], ["翔太", "ショウタ"], ["大輝", "ダイキ"], ["蓮", "レン"],
  ["悠真", "ユウマ"], ["陽翔", "ハルト"], ["颯太", "ソウタ"], ["大翔", "ヒロト"],
  ["湊", "ミナト"], ["樹", "イツキ"], ["悠人", "ユウト"], ["陸", "リク"],
  ["駿", "シュン"], ["海斗", "カイト"], ["翼", "ツバサ"], ["健太", "ケンタ"],
  ["拓海", "タクミ"], ["蒼", "アオイ"], ["颯真", "ソウマ"], ["優斗", "ユウト"],
  ["直樹", "ナオキ"], ["康太", "コウタ"], ["雄大", "ユウダイ"], ["和也", "カズヤ"],
  ["亮", "リョウ"], ["一真", "カズマ"], ["隼人", "ハヤト"], ["奏太", "ソウタ"],
  ["結翔", "ユイト"], ["朝陽", "アサヒ"], ["瑛太", "エイタ"], ["新", "アラタ"],
];

const GIRL_NAMES: [string, string][] = [
  ["美咲", "ミサキ"], ["あかり", "アカリ"], ["陽菜", "ヒナ"], ["結衣", "ユイ"],
  ["さくら", "サクラ"], ["凛", "リン"], ["花", "ハナ"], ["莉子", "リコ"],
  ["美月", "ミヅキ"], ["優花", "ユウカ"], ["真央", "マオ"], ["彩花", "アヤカ"],
  ["心春", "コハル"], ["琴音", "コトネ"], ["芽依", "メイ"], ["紬", "ツムギ"],
  ["楓", "カエデ"], ["葵", "アオイ"], ["千尋", "チヒロ"], ["七海", "ナナミ"],
  ["春香", "ハルカ"], ["愛", "アイ"], ["彩", "アヤ"], ["杏", "アン"],
  ["麻衣", "マイ"], ["桃花", "モモカ"], ["実花", "ミカ"], ["詩織", "シオリ"],
  ["萌", "モエ"], ["奈々", "ナナ"], ["瑠奈", "ルナ"], ["日向", "ヒナタ"],
];

const PARENT_FIRST_NAMES_MALE = ["健一", "正", "浩二", "誠", "豊", "隆", "修", "博", "剛", "学"];
const PARENT_FIRST_NAMES_FEMALE = ["花子", "直子", "裕子", "恵子", "美香", "洋子", "幸子", "智子", "久美子", "由美"];

// ---------------------------------------------------------------------------
// School / grade mapping
// ---------------------------------------------------------------------------
const SCHOOLS_BY_LEVEL: Record<string, string[]> = {
  elementary: ["佐竹小学校", "中央小学校", "東小学校"],
  junior: ["佐竹中学校", "中央中学校", "東中学校", "南中学校"],
  high: ["佐竹高校", "中央高校", "東高校"],
};

type GradeLevel =
  | "elementary-1" | "elementary-2" | "elementary-3"
  | "elementary-4" | "elementary-5" | "elementary-6"
  | "junior-1" | "junior-2" | "junior-3"
  | "high-1" | "high-2" | "high-3";

// Weighted distribution: junior high ~45%, elementary ~40%, high ~15%
const GRADE_POOL: GradeLevel[] = [
  // elementary (48 slots for ~40%)
  ...Array(4).fill("elementary-1" as GradeLevel),
  ...Array(5).fill("elementary-2" as GradeLevel),
  ...Array(6).fill("elementary-3" as GradeLevel),
  ...Array(7).fill("elementary-4" as GradeLevel),
  ...Array(9).fill("elementary-5" as GradeLevel),
  ...Array(10).fill("elementary-6" as GradeLevel),
  // junior high (54 slots for ~45%)
  ...Array(16).fill("junior-1" as GradeLevel),
  ...Array(20).fill("junior-2" as GradeLevel),
  ...Array(18).fill("junior-3" as GradeLevel),
  // high (18 slots for ~15%)
  ...Array(7).fill("high-1" as GradeLevel),
  ...Array(6).fill("high-2" as GradeLevel),
  ...Array(5).fill("high-3" as GradeLevel),
];

function levelOf(g: GradeLevel): string {
  return g.split("-")[0];
}

// ---------------------------------------------------------------------------
// Subjects, enrollment dates, phone numbers
// ---------------------------------------------------------------------------
const ALL_SUBJECTS = ["国語", "数学", "英語", "理科", "社会"];

const ENROLLMENT_DATES = [
  "2023-04-01", "2023-07-01", "2023-09-01",
  "2024-04-01", "2024-07-01", "2024-09-01",
  "2025-04-01", "2025-07-01", "2025-09-01",
  "2026-04-01",
];

function phoneNumber(index: number): string {
  const base = 1000 + index * 97;
  const a = String(base % 10000).padStart(4, "0");
  const b = String((base * 7 + 3210) % 10000).padStart(4, "0");
  return `090-${a}-${b}`;
}

function emailAddress(lastName: string, index: number): string {
  const romanMap: Record<string, string> = {
    "田中": "tanaka", "佐藤": "sato", "鈴木": "suzuki", "山田": "yamada",
    "高橋": "takahashi", "伊藤": "ito", "渡辺": "watanabe", "中村": "nakamura",
    "小林": "kobayashi", "加藤": "kato", "吉田": "yoshida", "山口": "yamaguchi",
    "松本": "matsumoto", "井上": "inoue", "木村": "kimura", "林": "hayashi",
    "斎藤": "saito", "清水": "shimizu", "山崎": "yamazaki", "森": "mori",
    "池田": "ikeda", "橋本": "hashimoto", "阿部": "abe", "石川": "ishikawa",
    "前田": "maeda", "藤田": "fujita", "小川": "ogawa", "岡田": "okada",
    "後藤": "goto", "長谷川": "hasegawa", "村上": "murakami", "近藤": "kondo",
    "石井": "ishii", "坂本": "sakamoto", "遠藤": "endo", "青木": "aoki",
    "藤井": "fujii", "西村": "nishimura", "福田": "fukuda", "太田": "ota",
    "三浦": "miura", "岡本": "okamoto", "松田": "matsuda", "中島": "nakajima",
    "中野": "nakano", "原田": "harada", "小野": "ono", "田村": "tamura",
    "竹内": "takeuchi", "金子": "kaneko", "和田": "wada", "中山": "nakayama",
  };
  const roman = romanMap[lastName] || "unknown";
  return `${roman}${index}@example.com`;
}

// ---------------------------------------------------------------------------
// Generate 120 students
// ---------------------------------------------------------------------------
function generateStudents(now: string) {
  const data: Record<string, unknown>[] = [];

  for (let i = 0; i < 120; i++) {
    const [lastName, lastNameKana] = pick(LAST_NAMES);
    const isBoy = rand() < 0.5;
    const [firstName, firstNameKana] = isBoy ? pick(BOY_NAMES) : pick(GIRL_NAMES);

    const gradeLevel = pick(GRADE_POOL);
    const level = levelOf(gradeLevel);
    const school = pick(SCHOOLS_BY_LEVEL[level]);

    const numSubjects = 2 + Math.floor(rand() * 3); // 2–4
    const subjects = pickN(ALL_SUBJECTS, numSubjects);

    let enrollmentStatus: "enrolled" | "suspended" | "withdrawn";
    if (i < 110) enrollmentStatus = "enrolled";
    else if (i < 116) enrollmentStatus = "suspended";
    else enrollmentStatus = "withdrawn";

    const enrolledAt = pick(ENROLLMENT_DATES);

    const parentFirstName = isBoy
      ? pick(PARENT_FIRST_NAMES_FEMALE)
      : (rand() < 0.5 ? pick(PARENT_FIRST_NAMES_MALE) : pick(PARENT_FIRST_NAMES_FEMALE));

    const withdrawnAt = enrollmentStatus === "withdrawn"
      ? "2026-03-31"
      : undefined;

    data.push({
      id: uuidv4(),
      lastName,
      firstName,
      lastNameKana,
      firstNameKana,
      gradeLevel,
      school,
      enrollmentStatus,
      enrolledAt,
      ...(withdrawnAt ? { withdrawnAt } : {}),
      parent: {
        name: `${lastName} ${parentFirstName}`,
        phone: phoneNumber(i),
        email: emailAddress(lastName, i),
      },
      subjects,
      createdAt: now,
      updatedAt: now,
    });
  }

  return data;
}

// ---------------------------------------------------------------------------
// Generate 定期考査 records for ALL junior high & high school students
// 累積: 中2なら中1+中2の全テスト、中3なら中1+中2+中3、高校も同様
// ---------------------------------------------------------------------------
function generateGrades(
  studentData: Record<string, unknown>[],
  now: string,
) {
  // 中学: 各学年6回 / 高校: 各学年5回
  // examName に学年プレフィックスを付けて区別する
  function juniorExams(year: number, yearLabel: string) {
    const baseYear = 2026 - (3 - year); // year=1→2024, year=2→2025, year=3→2026
    const isYear3 = (year === 3);
    return [
      { examName: `${yearLabel} 1学期中間テスト`, date: `${baseYear}-05-20` },
      { examName: `${yearLabel} 1学期期末テスト`, date: `${baseYear}-07-05` },
      { examName: `${yearLabel} ${isYear3 ? "2学期実力テスト" : "2学期課題テスト"}`, date: `${baseYear}-09-05` },
      { examName: `${yearLabel} 2学期中間テスト`, date: `${baseYear}-10-15` },
      { examName: `${yearLabel} 2学期期末テスト`, date: `${baseYear}-12-10` },
      { examName: `${yearLabel} 3学期学年末テスト`, date: `${baseYear + 1}-02-25` },
    ];
  }

  function highExams(year: number, yearLabel: string) {
    const baseYear = 2026 - (3 - year);
    return [
      { examName: `${yearLabel} 1学期中間テスト`, date: `${baseYear}-05-20` },
      { examName: `${yearLabel} 1学期期末テスト`, date: `${baseYear}-07-05` },
      { examName: `${yearLabel} 2学期中間テスト`, date: `${baseYear}-10-15` },
      { examName: `${yearLabel} 2学期期末テスト`, date: `${baseYear}-12-10` },
      { examName: `${yearLabel} 3学期学年末テスト`, date: `${baseYear + 1}-02-25` },
    ];
  }

  // 学年ごとの累積テストスケジュール
  const examsByGrade: Record<string, { examName: string; date: string }[]> = {
    "junior-1": [...juniorExams(1, "中1")],
    "junior-2": [...juniorExams(1, "中1"), ...juniorExams(2, "中2")],
    "junior-3": [...juniorExams(1, "中1"), ...juniorExams(2, "中2"), ...juniorExams(3, "中3")],
    "high-1": [...highExams(1, "高1")],
    "high-2": [...highExams(1, "高1"), ...highExams(2, "高2")],
    "high-3": [...highExams(1, "高1"), ...highExams(2, "高2"), ...highExams(3, "高3")],
  };

  const subjects = ["国語", "数学", "英語", "理科", "社会"];

  const data: Record<string, unknown>[] = [];

  for (const s of studentData) {
    const gradeLevel = s.gradeLevel as string;
    const exams = examsByGrade[gradeLevel];
    if (!exams) continue;

    const studentName = `${s.lastName} ${s.firstName}`;

    // Deterministic base score per student (40–80)
    const baseScore = 40 + Math.floor(rand() * 41);

    for (const exam of exams) {
      for (const subject of subjects) {
        // Add per-subject/exam variance (±15), clamp to 30–100
        const variance = Math.floor(rand() * 31) - 15;
        const score = Math.max(30, Math.min(100, baseScore + variance));

        data.push({
          id: uuidv4(),
          studentId: s.id,
          studentName,
          examType: "regular",
          examName: exam.examName,
          date: exam.date,
          subject,
          score,
          maxScore: 100,
          rank: 1 + Math.floor(rand() * 150),
          totalStudents: 150,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  return data;
}

// ---------------------------------------------------------------------------
// Generate billing records for first 20 students
// ---------------------------------------------------------------------------
function generateBilling(
  studentData: Record<string, unknown>[],
  now: string,
) {
  const data: Record<string, unknown>[] = [];
  const months = ["2026-01", "2026-02", "2026-03", "2026-04"];

  // 月謝テーブル（学年別）
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

  // enrolled な生徒全員に請求データを作成
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    if (s.enrollmentStatus !== "enrolled") continue;

    const studentName = `${s.lastName} ${s.firstName}`;
    const subjectCount = (s.subjects as string[]).length;
    const amount = tuitionForGrade(s.gradeLevel as string) * subjectCount;

    // 各生徒に1〜4月分の請求
    for (const month of ["2026-01", "2026-02", "2026-03", "2026-04"]) {
      let isPaid: boolean;
      if (month <= "2026-02") {
        isPaid = true; // 1,2月は全員支払済み
      } else if (month === "2026-03") {
        isPaid = rand() < 0.85; // 3月は85%支払済み
      } else {
        isPaid = rand() < 0.35; // 4月は35%が入金済み（徐々に入金中）
      }
      data.push({
        id: uuidv4(),
        studentId: s.id,
        studentName,
        billingType: "monthly",
        description: `${month.slice(5)}月分月謝`,
        amount,
        billingMonth: month,
        status: isPaid ? "paid" : "pending",
        dueDate: `${month}-25`,
        ...(isPaid ? { paidAt: `${month}-20`, paymentMethod: "現金" } : {}),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return data;
}

function getPartitionKey(containerName: string): string {
  const map: Record<string, string> = {
    students: "gradeLevel",
    schedules: "dayOfWeek",
    absences: "studentId",
    grades: "studentId",
    billing: "studentId",
    notifications: "targetRole",
    settings: "category",
  };
  return map[containerName] || "id";
}

async function seed() {
  if (!endpoint || !key) {
    console.error("❌ 先に scripts/setup-cosmosdb.ts を実行してください");
    process.exit(1);
  }

  const client = new CosmosClient({
    endpoint,
    key,
    connectionPolicy: { requestTimeout: 300000 },
  });
  const database = client.database(databaseId);
  const now = new Date().toISOString();

  // --- 既存データ削除（コンテナ再作成で高速化） ---
  console.log("🗑️  既存データを削除中...");
  const containerConfigs: Record<string, { partitionKey: string; compositeIndexes?: { path: string; order: string }[][] }> = {
    students: {
      partitionKey: "/gradeLevel",
      compositeIndexes: [[
        { path: "/lastNameKana", order: "ascending" },
        { path: "/firstNameKana", order: "ascending" },
      ]],
    },
    schedules: {
      partitionKey: "/dayOfWeek",
      compositeIndexes: [[
        { path: "/dayOfWeek", order: "ascending" },
        { path: "/startTime", order: "ascending" },
      ]],
    },
    absences: {
      partitionKey: "/studentId",
    },
    grades: {
      partitionKey: "/studentId",
    },
    billing: {
      partitionKey: "/studentId",
      compositeIndexes: [[
        { path: "/billingMonth", order: "descending" },
        { path: "/studentName", order: "ascending" },
      ]],
    },
    notifications: {
      partitionKey: "/targetRole",
    },
  };
  for (const [name, config] of Object.entries(containerConfigs)) {
    try {
      try { await database.container(name).delete(); } catch { /* doesn't exist */ }
      // Cosmos DB needs time after container deletion
      await new Promise((r) => setTimeout(r, 3000));
      const createBody: Record<string, unknown> = {
        id: name,
        partitionKey: { paths: [config.partitionKey] },
      };
      if (config.compositeIndexes) {
        createBody.indexingPolicy = { compositeIndexes: config.compositeIndexes };
      }
      await database.containers.create(createBody as Parameters<typeof database.containers.create>[0]);
      console.log(`  ✅ ${name}: 再作成完了`);
    } catch (e) {
      console.log(`  ⚠️ ${name}: スキップ (${e instanceof Error ? e.message.slice(0, 80) : e})`);
    }
  }

  // --- 生徒データ (120名) ---
  console.log("👤 生徒データを投入中...");
  const students = database.container("students");
  const studentData = generateStudents(now);

  for (const s of studentData) {
    await students.items.create(s);
  }
  console.log(`  ✅ ${studentData.length}名の生徒を登録`);

  // --- スケジュールデータ ---
  console.log("📅 授業スケジュールを投入中...");
  const schedules = database.container("schedules");
  const teachers = ["佐竹先生", "坂本先生", "浅野先生", "芝先生", "岡本先生"];
  let teacherIdx = 0;
  function nextTeacher() { const t = teachers[teacherIdx % teachers.length]; teacherIdx++; return t; }
  function mockStudents(count: number) { return Array.from({ length: count }, (_, i) => `mock-student-${teacherIdx}-${i}`); }

  function sched(dayOfWeek: number, period: number, startTime: string, endTime: string, label: string, subject: string, gradeLevel: string, room: string, isSpringCourse = false, isImportant = false, enrolled = 0) {
    const teacher = nextTeacher();
    return { id: uuidv4(), dayOfWeek, period, startTime, endTime, label, subject, gradeLevel, teacherName: teacher, room, maxStudents: 8, enrolledStudentIds: mockStudents(enrolled), isActive: true, isSpringCourse, isImportant, createdAt: now, updatedAt: now };
  }

  const scheduleData = [
    // === Period 1 ===
    // A教室
    sched(2, 1, "13:00", "14:00", "小学低学年算数", "算数", "elementary-3", "A教室", false, false, 5),
    sched(3, 1, "13:00", "14:00", "小学低学年国語", "国語", "elementary-3", "A教室", false, false, 4),
    sched(4, 1, "13:00", "14:00", "小学低学年算数", "算数", "elementary-3", "A教室", false, false, 6),
    sched(5, 1, "13:00", "14:00", "小学低学年国語", "国語", "elementary-3", "A教室", false, false, 3),
    sched(6, 1, "13:00", "14:00", "小学プログラミング", "プログラミング", "elementary-4", "A教室", false, false, 7),
    sched(1, 1, "13:00", "14:00", "小学低学年算数", "算数", "elementary-3", "A教室", false, false, 5),
    // B教室
    sched(2, 1, "13:00", "14:30", "小学高学年算数", "算数", "elementary-5", "B教室", false, false, 6),
    sched(3, 1, "13:00", "14:30", "小学高学年英語", "英語", "elementary-5", "B教室", false, false, 4),
    sched(4, 1, "13:00", "14:30", "小学高学年算数", "算数", "elementary-5", "B教室", false, false, 7),
    sched(5, 1, "13:00", "14:30", "小学高学年国語", "国語", "elementary-5", "B教室", false, false, 5),
    sched(1, 1, "13:00", "14:30", "小学高学年英語", "英語", "elementary-5", "B教室", false, false, 3),

    // === Period 2 ===
    // A教室
    sched(2, 2, "14:40", "15:40", "小学低学年国語", "国語", "elementary-3", "A教室", false, false, 4),
    sched(4, 2, "14:40", "15:40", "小学低学年国語", "国語", "elementary-3", "A教室", false, false, 5),
    sched(5, 2, "14:40", "15:40", "小学低学年算数", "算数", "elementary-3", "A教室", false, false, 6),
    sched(6, 2, "14:10", "15:40", "中3演習授業", "総合", "junior-3", "A教室", false, false, 8),
    sched(1, 2, "14:40", "15:40", "小学低学年国語", "国語", "elementary-3", "A教室", false, false, 3),
    // B教室
    sched(2, 2, "14:40", "16:10", "小学高学年英語", "英語", "elementary-5", "B教室", false, false, 5),
    sched(4, 2, "14:40", "16:10", "小学高学年国語", "国語", "elementary-5", "B教室", false, false, 6),
    sched(5, 2, "14:40", "16:10", "小学高学年算数", "算数", "elementary-5", "B教室", false, false, 4),
    sched(1, 2, "14:40", "16:10", "小学高学年算数", "算数", "elementary-5", "B教室", false, false, 7),

    // === Period 3 ===
    // A教室
    sched(2, 3, "16:20", "17:20", "小学生算数", "算数", "elementary-4", "A教室", false, false, 5),
    sched(3, 3, "15:50", "17:20", "小学理科", "理科", "elementary-5", "A教室", true, false, 6),
    // B教室
    sched(3, 3, "15:50", "17:20", "中1数学", "数学", "junior-1", "B教室", false, false, 7),
    sched(5, 3, "15:50", "17:20", "高校英語", "英語", "high-1", "B教室", true, false, 3),
    sched(6, 3, "15:50", "17:20", "プログラミング", "プログラミング", "junior-2", "B教室", false, false, 5),

    // === Period 4 ===
    // A教室
    sched(2, 4, "17:30", "19:00", "中1国語", "国語", "junior-1", "A教室", false, false, 6),
    sched(3, 4, "17:30", "19:00", "小学英語", "英語", "elementary-5", "A教室", false, false, 8),
    sched(4, 4, "17:30", "19:00", "中1英語", "英語", "junior-1", "A教室", true, false, 7),
    sched(5, 4, "17:30", "19:00", "中1数学", "数学", "junior-1", "A教室", true, false, 5),
    sched(6, 4, "17:30", "19:00", "中3社会", "社会", "junior-3", "A教室", false, true, 8),
    sched(1, 4, "17:30", "19:00", "小学生国語", "国語", "elementary-4", "A教室", false, false, 4),
    // B教室
    sched(2, 4, "17:30", "19:00", "小学生算数", "算数", "elementary-4", "B教室", false, false, 5),
    sched(3, 4, "17:30", "19:00", "小学生算数", "算数", "elementary-4", "B教室", false, false, 6),
    sched(4, 4, "17:30", "19:00", "小学英語", "英語", "elementary-5", "B教室", false, false, 4),
    sched(5, 4, "17:30", "19:00", "小学生国語", "国語", "elementary-4", "B教室", false, false, 7),
    sched(1, 4, "17:30", "19:00", "中1数学振替4/6", "数学", "junior-1", "B教室", true, false, 3),

    // === Period 5 ===
    // A教室
    sched(2, 5, "19:30", "21:00", "A中2英語", "英語", "junior-2", "A教室", true, false, 6),
    sched(3, 5, "19:30", "21:00", "スピーキング・英検", "英語", "junior-2", "A教室", true, false, 5),
    sched(4, 5, "19:30", "21:00", "中3数学", "数学", "junior-3", "A教室", true, false, 8),
    sched(5, 5, "19:30", "21:00", "中2数学", "数学", "junior-2", "A教室", true, false, 7),
    sched(1, 5, "19:30", "21:00", "中3国語", "国語", "junior-3", "A教室", false, true, 6),
    // B教室
    sched(3, 5, "19:30", "21:00", "中3英語", "英語", "junior-3", "B教室", false, false, 4),
    sched(4, 5, "19:30", "21:00", "B中2英語", "英語", "junior-2", "B教室", false, false, 5),
    sched(6, 5, "19:30", "21:00", "プログラミング", "プログラミング", "junior-2", "B教室", false, false, 3),
    sched(1, 5, "19:30", "21:00", "中2国語", "国語", "junior-2", "B教室", true, false, 7),

    // === Period 6 ===
    // A教室
    sched(2, 6, "21:10", "22:40", "中3国語", "国語", "junior-3", "A教室", false, false, 5),
    sched(3, 6, "21:10", "22:40", "中3英語", "英語", "junior-3", "A教室", true, true, 8),
    sched(4, 6, "21:10", "22:40", "中3数学", "数学", "junior-3", "A教室", false, true, 7),
    sched(5, 6, "21:10", "22:40", "中2数学", "数学", "junior-2", "A教室", true, true, 6),
    sched(6, 6, "21:10", "22:40", "中3社会", "社会", "junior-3", "A教室", false, true, 8),
    sched(1, 6, "21:10", "22:40", "中3理科", "理科", "junior-3", "A教室", false, true, 5),
    // B教室
    sched(2, 6, "21:10", "22:40", "中2英語", "英語", "junior-2", "B教室", true, true, 7),
    sched(5, 6, "21:10", "22:40", "中3理科", "理科", "junior-3", "B教室", false, false, 4),
  ];

  for (const s of scheduleData) {
    await schedules.items.create(s);
  }
  console.log(`  ✅ ${scheduleData.length}件のスケジュールを登録`);

  // --- 欠席データ ---
  console.log("🚫 欠席データを投入中...");
  const absencesContainer = database.container("absences");

  const reasons = ["体調不良", "家庭の事情", "学校行事", "通院", "部活の試合", "冠婚葬祭", "インフルエンザ", "発熱", "怪我", "旅行"];
  const subjects = ["数学", "英語", "国語", "理科", "社会", "算数", "プログラミング"];
  const periods = ["13:00-14:00", "14:40-15:40", "16:20-17:20", "17:30-19:00", "19:30-21:00", "21:10-22:40"];
  const gradeLevels = ["小学3年", "小学5年", "中1", "中2", "中3", "高1"];

  function absence(
    idx: number,
    status: "reported" | "rescheduled" | "completed",
    dateOffset: number,
    reschedOffset?: number,
  ) {
    const student = studentData[idx % studentData.length];
    const rng = mulberry32(idx * 7 + dateOffset);
    const subj = subjects[Math.floor(rng() * subjects.length)];
    const period = periods[Math.floor(rng() * periods.length)];
    const reason = reasons[Math.floor(rng() * reasons.length)];
    const grade = gradeLevels[Math.floor(rng() * gradeLevels.length)];
    const origDate = new Date(2026, 2, 24 + dateOffset).toISOString().slice(0, 10); // 2026-03-24 base
    const reschDate = reschedOffset != null ? new Date(2026, 2, 24 + reschedOffset).toISOString().slice(0, 10) : undefined;
    return {
      id: uuidv4(),
      studentId: student.id,
      studentName: `${student.lastName} ${student.firstName}`,
      gradeLevel: grade,
      originalDate: origDate,
      schedulePeriod: period,
      subject: subj,
      reason,
      status,
      rescheduledDate: reschDate,
      reportedBy: rng() > 0.5 ? "parent" : "staff",
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
  }

  const absenceData = [
    // 欠席一覧 (reported) 10件
    absence(0, "reported", 0),
    absence(3, "reported", 1),
    absence(7, "reported", 2),
    absence(12, "reported", 0),
    absence(18, "reported", 3),
    absence(25, "reported", 1),
    absence(33, "reported", 4),
    absence(41, "reported", 2),
    absence(55, "reported", 5),
    absence(67, "reported", 3),
    // 振替実施予定 (rescheduled) 15件
    absence(1, "rescheduled", -2, 5),
    absence(5, "rescheduled", -1, 6),
    absence(9, "rescheduled", -3, 4),
    absence(14, "rescheduled", 0, 7),
    absence(20, "rescheduled", -4, 3),
    absence(27, "rescheduled", -1, 8),
    absence(35, "rescheduled", -2, 5),
    absence(42, "rescheduled", -5, 6),
    absence(50, "rescheduled", -3, 7),
    absence(58, "rescheduled", -1, 4),
    absence(63, "rescheduled", 0, 9),
    absence(71, "rescheduled", -2, 8),
    absence(78, "rescheduled", -4, 5),
    absence(85, "rescheduled", -1, 10),
    absence(92, "rescheduled", -3, 6),
    // 振替実施済み (completed) 20件
    absence(2, "completed", -10, -5),
    absence(4, "completed", -12, -7),
    absence(8, "completed", -8, -3),
    absence(11, "completed", -14, -9),
    absence(16, "completed", -11, -6),
    absence(22, "completed", -9, -4),
    absence(29, "completed", -13, -8),
    absence(36, "completed", -7, -2),
    absence(43, "completed", -15, -10),
    absence(48, "completed", -10, -5),
    absence(53, "completed", -12, -7),
    absence(60, "completed", -8, -3),
    absence(65, "completed", -14, -9),
    absence(72, "completed", -11, -6),
    absence(76, "completed", -9, -4),
    absence(80, "completed", -13, -8),
    absence(84, "completed", -7, -2),
    absence(88, "completed", -15, -10),
    absence(93, "completed", -10, -5),
    absence(97, "completed", -12, -7),
  ];

  for (const a of absenceData) {
    await absencesContainer.items.create(a);
  }
  console.log(`  ✅ ${absenceData.length}件の欠席データを登録`);

  // --- 成績データ ---
  console.log("📊 成績データを投入中...");
  const grades = database.container("grades");
  const gradeData = generateGrades(studentData, now);
  console.log(`  📝 ${gradeData.length}件を投入予定...`);

  // 20件並列で投入
  for (let i = 0; i < gradeData.length; i += 20) {
    const batch = gradeData.slice(i, i + 20);
    await Promise.all(batch.map((g) => grades.items.create(g)));
    if ((i + 20) % 200 === 0) process.stdout.write(`  ${i + 20}/${gradeData.length}\n`);
  }
  console.log(`  ✅ ${gradeData.length}件の成績を登録`);

  // --- 請求データ (先頭20名分) ---
  console.log("💰 請求データを投入中...");
  const billing = database.container("billing");
  const billingData = generateBilling(studentData, now);

  for (const b of billingData) {
    await billing.items.create(b);
  }
  console.log(`  ✅ ${billingData.length}件の請求を登録`);

  // --- お知らせ ---
  console.log("📢 お知らせを投入中...");
  const notifications = database.container("notifications");
  const notificationData = [
    { id: uuidv4(), title: "春期講習のお知らせ", body: "3月26日〜4月5日に春期講習を実施します。詳細は別途配布の案内をご確認ください。", targetRole: "all", publishedAt: "2026-03-01T09:00:00Z", isPublished: true, createdAt: now, updatedAt: now },
    { id: uuidv4(), title: "4月分月謝について", body: "4月分の月謝の引き落とし日は4月25日です。残高のご確認をお願いいたします。", targetRole: "parent", publishedAt: "2026-03-20T09:00:00Z", isPublished: true, createdAt: now, updatedAt: now },
  ];

  for (const n of notificationData) {
    await notifications.items.create(n);
  }
  console.log(`  ✅ ${notificationData.length}件のお知らせを登録`);

  console.log("\n🎉 シードデータ投入完了！");
}

seed().catch((err) => {
  console.error("❌ シード失敗:", err.message);
  process.exit(1);
});
