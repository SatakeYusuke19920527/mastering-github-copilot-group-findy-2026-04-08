import { getContainer, CONTAINERS } from "@/lib/cosmos";
import type { GradeLevel } from "@/lib/types";
import type { TuitionCategory } from "@/lib/types/tuition";
import { DEFAULT_TUITION_CATEGORIES, getTuitionCategoryForGradeLevel } from "@/lib/types/tuition";

const SETTINGS_DOC_ID = "tuition-categories";
const PARTITION_KEY = "tuition";

interface TuitionSettingsDoc {
  id: string;
  category: string;
  categories: TuitionCategory[];
}

export async function getTuitionCategories(): Promise<TuitionCategory[]> {
  try {
    const container = getContainer(CONTAINERS.SETTINGS);
    const { resource } = await container.item(SETTINGS_DOC_ID, PARTITION_KEY).read<TuitionSettingsDoc>();
    if (resource?.categories) {
      return resource.categories;
    }
  } catch {
    // Document not found — return defaults
  }
  return DEFAULT_TUITION_CATEGORIES;
}

export async function saveTuitionCategories(categories: TuitionCategory[]): Promise<void> {
  const container = getContainer(CONTAINERS.SETTINGS);
  const doc: TuitionSettingsDoc = {
    id: SETTINGS_DOC_ID,
    category: PARTITION_KEY,
    categories,
  };
  await container.items.upsert(doc);
}

export async function getTuitionFeeForStudent(gradeLevel: GradeLevel): Promise<number> {
  const categories = await getTuitionCategories();
  const categoryId = getTuitionCategoryForGradeLevel(gradeLevel);
  const category = categories.find((c) => c.id === categoryId);
  return category?.monthlyFee ?? 0;
}
