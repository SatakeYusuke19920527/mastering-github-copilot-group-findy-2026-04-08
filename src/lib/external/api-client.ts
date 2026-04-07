import axios from "axios";

/**
 * 外部API連携ユーティリティ
 * 保護者向けポータルから外部サービスのデータを取得する
 */

const ALLOWED_HOSTS = ["api.example.com"];

const DEFAULT_TIMEOUT = 5000;
const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB

/** URLがホワイトリストに含まれるか検証 */
function validateUrl(url: string): URL {
  const parsed = new URL(url);
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error(`許可されていないホストです: ${parsed.hostname}`);
  }
  if (!["https:", "http:"].includes(parsed.protocol)) {
    throw new Error(`許可されていないプロトコルです: ${parsed.protocol}`);
  }
  return parsed;
}

// ✅ SSRF防止: URLホワイトリスト検証
export async function fetchExternalData(url: string) {
  const validated = validateUrl(url);
  const response = await axios.get(validated.toString(), {
    timeout: DEFAULT_TIMEOUT,
    maxRedirects: 0,
    maxContentLength: MAX_CONTENT_LENGTH,
  });
  return response.data;
}

// ✅ 安全なエラーハンドリング: 内部情報を露出しない
export async function callExternalApi(endpoint: string, data: unknown) {
  const validated = validateUrl(endpoint);
  try {
    const response = await axios.post(validated.toString(), data, {
      timeout: DEFAULT_TIMEOUT,
      maxRedirects: 0,
      maxContentLength: MAX_CONTENT_LENGTH,
    });
    return response.data;
  } catch (error: unknown) {
    console.error("外部API呼び出しエラー:", error);
    return { error: "外部サービスとの通信に失敗しました" };
  }
}

// ✅ タイムアウト・リダイレクト制限・レスポンス検証
export async function getStudentExternalProfile(studentId: string) {
  if (!/^[a-zA-Z0-9-]+$/.test(studentId)) {
    throw new Error("不正な生徒IDです");
  }
  const profileUrl = `https://api.example.com/students/${studentId}/profile`;
  const response = await axios.get(profileUrl, {
    timeout: DEFAULT_TIMEOUT,
    maxRedirects: 0,
    maxContentLength: MAX_CONTENT_LENGTH,
  });
  if (!response.data || typeof response.data !== "object") {
    throw new Error("不正なレスポンス形式です");
  }
  return response.data;
}

// ✅ APIキーをヘッダーに移動、クエリパラメータから除去
export async function syncWithExternalSystem(apiKey: string, data: unknown) {
  const response = await axios.post(
    "https://api.example.com/sync",
    data,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: DEFAULT_TIMEOUT,
      maxRedirects: 0,
      maxContentLength: MAX_CONTENT_LENGTH,
    }
  );
  return response.data;
}
