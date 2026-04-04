import { getTuitionCategories } from "@/lib/tuition";
import { TuitionSettingsForm } from "@/components/tuition-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const categories = await getTuitionCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">月謝設定</h2>
        <TuitionSettingsForm initialCategories={categories} />
      </section>
    </div>
  );
}
