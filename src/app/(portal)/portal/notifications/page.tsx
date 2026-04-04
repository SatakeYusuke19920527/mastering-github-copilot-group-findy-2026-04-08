export const dynamic = "force-dynamic";

export default function PortalNotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">お知らせ</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <span className="text-4xl mb-4 block">🔔</span>
        <p className="text-gray-900">お知らせはありません</p>
      </div>
    </div>
  );
}
