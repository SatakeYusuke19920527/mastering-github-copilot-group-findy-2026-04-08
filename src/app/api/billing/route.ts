import { NextRequest, NextResponse } from "next/server";
import { listBillingRecords, createBillingRecord } from "@/lib/billing";
import type { BillingCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const studentId = searchParams.get("studentId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const billingMonth = searchParams.get("billingMonth") ?? undefined;

  const records = await listBillingRecords({ studentId, status, billingMonth });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as BillingCreateInput;
  const record = await createBillingRecord(body);
  return NextResponse.json(record, { status: 201 });
}
