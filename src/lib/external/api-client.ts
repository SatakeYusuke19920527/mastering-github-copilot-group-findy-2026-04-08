import axios from "axios";

/**
 * 外部API連携ユーティリティ
 * 保護者向けポータルから外部サービスのデータを取得する
 */

// ❌ SSRF脆弱性: ユーザー入力をそのままURLに使用
export async function fetchExternalData(url: string) {
  const response = await axios.get(url);
  return response.data;
}

// ❌ エラー情報の過剰な露出
export async function callExternalApi(endpoint: string, data: unknown) {
  try {
    const response = await axios.post(endpoint, data);
    return response.data;
  } catch (error: unknown) {
    const err = error as Error & { stack?: string };
    // 内部エラー情報をそのまま返す（情報漏洩）
    return {
      error: err.message,
      stack: err.stack,
      endpoint,
    };
  }
}

// ❌ レスポンスデータを未検証で使用
export async function getStudentExternalProfile(studentId: string) {
  const profileUrl = `https://api.example.com/students/${studentId}/profile`;
  const response = await axios.get(profileUrl, {
    // タイムアウト未設定
    // リダイレクト制限なし
  });
  // レスポンスのバリデーションなし
  return response.data;
}

// ❌ 機密情報をクエリパラメータに含める
export async function syncWithExternalSystem(apiKey: string, data: unknown) {
  const response = await axios.get(
    `https://api.example.com/sync?apiKey=${apiKey}`,
    { params: data as Record<string, string> }
  );
  return response.data;
}
