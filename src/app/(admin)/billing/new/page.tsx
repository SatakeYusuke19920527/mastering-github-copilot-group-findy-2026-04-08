import { BillingForm } from "@/components/billing-form";

export default function NewBillingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">請求登録</h1>
      <BillingForm mode="create" />
    </div>
  );
}
