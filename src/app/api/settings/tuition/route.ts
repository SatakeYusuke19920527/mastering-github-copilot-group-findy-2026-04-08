import { NextResponse } from "next/server";
import { getTuitionCategories, saveTuitionCategories } from "@/lib/tuition";
import type { TuitionCategory } from "@/lib/types";

export async function GET() {
  try {
    const categories = await getTuitionCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch tuition categories:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const categories: TuitionCategory[] = await request.json();
    const now = new Date().toISOString();
    const updated = categories.map((c) => ({ ...c, updatedAt: now }));
    await saveTuitionCategories(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to save tuition categories:", error);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
