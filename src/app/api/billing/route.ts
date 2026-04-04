import { NextRequest, NextResponse } from "next/server";
import { listBillingRecords, createBillingRecord } from "@/lib/billing";
import type { BillingCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const billingMonth = searchParams.get("billingMonth") ?? undefined;

    const records = await listBillingRecords({ studentId, status, billingMonth });
    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/billing error:", error);
    return NextResponse.json(
      { error: "請求一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BillingCreateInput;
    const record = await createBillingRecord(body);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("POST /api/billing error:", error);
    return NextResponse.json(
      { error: "請求の登録に失敗しました" },
      { status: 500 },
    );
  }
}
