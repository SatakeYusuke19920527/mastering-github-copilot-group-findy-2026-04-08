import { PortalAbsenceForm } from "@/components/portal-absence-form";

export default function PortalAbsencesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">欠席連絡</h1>

      <div className="max-w-lg">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-900 text-sm mb-6">
            お子様の欠席をご連絡ください。送信後、塾スタッフが確認いたします。
          </p>
          <PortalAbsenceForm />
        </div>
      </div>
    </div>
  );
}
