import { NextRequest, NextResponse } from "next/server";
import { listStudents, createStudent } from "@/lib/students";
import type { StudentCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const gradeLevel = searchParams.get("gradeLevel") ?? undefined;
  const enrollmentStatus = searchParams.get("enrollmentStatus") ?? undefined;

  const students = await listStudents({ gradeLevel, enrollmentStatus });
  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as StudentCreateInput;
  const student = await createStudent(body);
  return NextResponse.json(student, { status: 201 });
}
