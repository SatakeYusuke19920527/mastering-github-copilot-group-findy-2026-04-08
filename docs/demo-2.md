# DEMO 2: axios脆弱性の検知〜修復フロー

## 概要

axiosの脆弱性を検知し、Issue作成→修正実装→PR作成→マージまでの一連のセキュリティ修復フローをデモする。
Copilot CLIの `/research` → Issue作成 → 修正 → `/review` → PR → マージ のフローを見せる。

---

## DEMOフロー

### Step 1: `/research` — 脆弱性調査

```
/research axiosの既知の脆弱性（CVE）を調べて。特にSSRF、プロトタイプ汚染、CSRF トークン漏洩に関連するものを重点的に。現在のバージョンに影響があるか確認して
```

**見せどころ**: Copilotが Web・GitHub を横断検索し、CVE情報を収集・整理する様子

---

### Step 2: プロジェクト内の脆弱性確認

```
このプロジェクトでaxiosがどこで使われているか調べて、脆弱なコードパターンがないか分析して
```

**見せどころ**: コードベース全体をスキャンし、危険な実装パターンを特定

---

### Step 3: Issue作成

```
調査結果をもとにGitHub Issueを作成して。脆弱性の詳細、影響範囲、修正方針を含めて
```

または issue-writer エージェントを活用:

```
調査結果を元に、axiosの脆弱性修正に関するGitHub Issueを作成して
```

**見せどころ**: 調査結果が構造化されたIssueに自動変換される

---

### Step 4: 修正ブランチの作成と実装

```
Issue #XX に対応する修正ブランチを作成して、安全な実装に修正して。具体的には:
1. axiosのバージョンアップ
2. 脆弱なコードパターンの修正（入力バリデーション追加、URLホワイトリスト等）
3. セキュリティベストプラクティスの適用
```

**見せどころ**: Copilotが脆弱なコードを安全な実装に書き換える

---

### Step 5: `/review` — セキュリティレビュー

```
/review
```

**見せどころ**: AIがセキュリティ観点で修正の妥当性をチェック

---

### Step 6: `/diff` — 変更差分の確認

```
/diff
```

**見せどころ**: Before/After の差分を確認し、脆弱性が解消されていることを視覚的に確認

---

### Step 7: PR作成

```
/pr
```

または:

```
この修正内容でPull Requestを作成して。脆弱性の説明と修正内容のサマリーを含めて
```

**見せどころ**: 修正内容が自動でPR化され、レビュー可能な状態になる

---

### Step 8: マージ

```
gh pr merge --squash
```

**見せどころ**: CLIから直接マージまで完結

---

## 脆弱性パターン例

### Before（危険な実装）

```typescript
// ❌ SSRF脆弱性: ユーザー入力をそのままURLに使用
const response = await axios.get(userProvidedUrl);

// ❌ レスポンスデータを未検証で使用
const data = response.data;
processData(data);

// ❌ エラー情報の過剰な露出
catch (error) {
  res.status(500).json({ error: error.message, stack: error.stack });
}
```

### After（安全な実装）

```typescript
// ✅ URLのホワイトリスト検証
const ALLOWED_HOSTS = ["api.example.com"];
const url = new URL(userProvidedUrl);
if (!ALLOWED_HOSTS.includes(url.hostname)) {
  throw new Error("許可されていないホストです");
}
const response = await axios.get(url.toString(), {
  timeout: 5000,
  maxRedirects: 0,
});

// ✅ レスポンスデータのバリデーション
const data = schema.parse(response.data);

// ✅ 安全なエラーハンドリング
catch (error) {
  console.error("API error:", error);
  res.status(500).json({ error: "内部エラーが発生しました" });
}
```

---

## フロー全体像

```
/research（脆弱性調査）
    │
    ▼
コードベーススキャン（危険パターン特定）
    │
    ▼
GitHub Issue作成（脆弱性報告）
    │
    ▼
修正ブランチ作成 & 安全な実装
    │
    ▼
/review（セキュリティレビュー）
    │
    ▼
/diff（差分確認）
    │
    ▼
PR作成 → マージ
```

---

## 使用するCopilot CLI機能

| 機能 | 用途 |
|------|------|
| `/research` | Web・GitHub横断の脆弱性調査 |
| `/review` | セキュリティ観点のコードレビュー |
| `/diff` | 変更差分の確認 |
| `/pr` | Pull Request操作 |
| `gh` CLI | Issue作成・PRマージ |
| `@ファイル名` | 特定ファイルのコンテキスト参照 |
| issue-writer | 構造化Issue自動生成 |
| pr-writer | PR説明文自動生成 |
