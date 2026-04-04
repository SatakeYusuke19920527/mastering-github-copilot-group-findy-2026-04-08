export const dynamic = "force-dynamic";

export default function PortalGradesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">成績</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <span className="text-4xl mb-4 block">📊</span>
        <p className="text-gray-900">
          お子様の成績情報がここに表示されます
        </p>
        <p className="text-gray-900 text-sm mt-2">
          保護者と生徒の紐付け機能が実装され次第、成績データが表示されます。
        </p>
      </div>
    </div>
  );
}
