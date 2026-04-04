export const dynamic = "force-dynamic";

export default function PortalDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          ようこそ、佐竹塾 保護者ポータルへ
        </h2>
        <p className="text-blue-700">
          お子様の成績確認、欠席連絡、お知らせの確認ができます。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 最近の成績 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold text-gray-900">最近の成績</h3>
          </div>
          <p className="text-gray-900 text-sm">
            お子様の最新の成績情報がここに表示されます。
          </p>
        </div>

        {/* 今後の授業 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <h3 className="text-lg font-semibold text-gray-900">今後の授業</h3>
          </div>
          <p className="text-gray-900 text-sm">
            今後の授業スケジュールがここに表示されます。
          </p>
        </div>

        {/* お知らせ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔔</span>
            <h3 className="text-lg font-semibold text-gray-900">お知らせ</h3>
          </div>
          <p className="text-gray-900 text-sm">
            塾からのお知らせがここに表示されます。
          </p>
        </div>
      </div>
    </div>
  );
}
