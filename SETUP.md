# セットアップ手順

## 1. Clerk（認証）

1. [clerk.com](https://clerk.com) でアカウント作成・サインイン
2. 「Create application」で新しいアプリを作成
3. **Application name**: `佐竹塾` (任意)
4. **Sign-in options**: Email を有効にする
5. ダッシュボードから **API Keys** を取得:
   - `CLERK_PUBLISHABLE_KEY` (pk_test_...)
   - `CLERK_SECRET_KEY` (sk_test_...)

### ロール設定（管理者/保護者の権限分離）

1. Clerk Dashboard → **Roles** (Organization設定内)
2. 以下のロールを作成:
   - `admin` — 塾スタッフ用
   - `parent` — 保護者用
3. 各ユーザーにロールを割り当て

## 2. Azure Cosmos DB

1. [Azure Portal](https://portal.azure.com) にサインイン
2. 「Azure Cosmos DB」→「作成」
3. **API**: NoSQL (Core SQL) を選択
4. **アカウント名**: 任意（例: `satake-juku-db`）
5. **リージョン**: Japan East 推奨
6. **容量モード**: サーバーレス（開発時はコスト最適）
7. 作成後、「キー」からエンドポイントとキーを取得:
   - `COSMOS_ENDPOINT`
   - `COSMOS_KEY`（プライマリキー）

## 3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して取得したキーを設定:

```
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
COSMOS_ENDPOINT=https://xxxxx.documents.azure.com:443/
COSMOS_KEY=xxxxx
COSMOS_DATABASE=satake-juku
```

## 4. データベースセットアップ

```bash
# コンテナ作成
npm run db:setup

# サンプルデータ投入（任意）
npm run db:seed
```

## 5. 開発サーバー起動

```bash
npm run dev
```

- 管理者画面: http://localhost:3000/students
- 保護者ポータル: http://localhost:3000/portal
