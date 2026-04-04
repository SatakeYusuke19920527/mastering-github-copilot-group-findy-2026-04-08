import { CosmosClient, IndexingPolicy } from "@azure/cosmos";
import * as dotenv from "dotenv";
import * as path from "path";

// .env.local を読み込む
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DATABASE || "satake-juku";

interface ContainerDef {
  id: string;
  partitionKey: string;
  indexingPolicy?: IndexingPolicy;
}

const containers: ContainerDef[] = [
  {
    id: "students",
    partitionKey: "/gradeLevel",
    indexingPolicy: {
      compositeIndexes: [
        [
          { path: "/lastNameKana", order: "ascending" },
          { path: "/firstNameKana", order: "ascending" },
        ],
      ],
    },
  },
  {
    id: "grades",
    partitionKey: "/studentId",
  },
  {
    id: "schedules",
    partitionKey: "/dayOfWeek",
    indexingPolicy: {
      compositeIndexes: [
        [
          { path: "/dayOfWeek", order: "ascending" },
          { path: "/startTime", order: "ascending" },
        ],
      ],
    },
  },
  {
    id: "billing",
    partitionKey: "/studentId",
    indexingPolicy: {
      compositeIndexes: [
        [
          { path: "/billingMonth", order: "descending" },
          { path: "/studentName", order: "ascending" },
        ],
      ],
    },
  },
  {
    id: "absences",
    partitionKey: "/studentId",
  },
  {
    id: "notifications",
    partitionKey: "/targetRole",
  },
  {
    id: "settings",
    partitionKey: "/category",
  },
];

async function setup() {
  if (!endpoint || !key) {
    console.error("❌ COSMOS_ENDPOINT と COSMOS_KEY を .env.local に設定してください");
    process.exit(1);
  }

  const client = new CosmosClient({ endpoint, key });

  console.log(`📦 データベース "${databaseId}" を作成中...`);
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  console.log(`✅ データベース "${databaseId}" 準備完了`);

  for (const def of containers) {
    console.log(`  📁 コンテナ "${def.id}" (partitionKey: ${def.partitionKey}) を作成/更新中...`);

    // createIfNotExists ではインデックスポリシーが更新されないため、
    // 既存コンテナがあれば replace で更新する
    try {
      const { resource: existing } = await database.container(def.id).read();
      if (existing && def.indexingPolicy) {
        existing.indexingPolicy = {
          ...existing.indexingPolicy,
          compositeIndexes: def.indexingPolicy.compositeIndexes,
        };
        await database.container(def.id).replace(existing);
        console.log(`  ✅ コンテナ "${def.id}" インデックス更新完了`);
      } else {
        console.log(`  ✅ コンテナ "${def.id}" 既存（変更なし）`);
      }
    } catch {
      // コンテナが存在しない場合は新規作成
      await database.containers.createIfNotExists({
        id: def.id,
        partitionKey: { paths: [def.partitionKey] },
        indexingPolicy: def.indexingPolicy,
      });
      console.log(`  ✅ コンテナ "${def.id}" 新規作成完了`);
    }
  }

  console.log("\n🎉 Cosmos DB セットアップ完了！");
}

setup().catch((err) => {
  console.error("❌ セットアップ失敗:", err.message);
  process.exit(1);
});
