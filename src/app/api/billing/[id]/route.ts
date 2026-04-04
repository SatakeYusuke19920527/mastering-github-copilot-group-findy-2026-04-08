import { NextRequest, NextResponse } from "next/server";
import { getBillingRecord, updateBillingRecord, deleteBillingRecord } from "@/lib/billing";
import type { BillingUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const studentId = _request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const record = await getBillingRecord(id, studentId);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = (await request.json()) as BillingUpdateInput & { studentId: string };
  const { studentId, ...updates } = body;

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const record = await updateBillingRecord(id, studentId, updates);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const success = await deleteBillingRecord(id, studentId);
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
