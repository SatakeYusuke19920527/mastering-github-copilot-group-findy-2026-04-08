import { v4 as uuidv4 } from "uuid";
import { getContainer, CONTAINERS } from "@/lib/cosmos";
import type {
  ExamResult,
  ExamResultCreateInput,
  ExamResultUpdateInput,
} from "@/lib/types";

const container = () => getContainer(CONTAINERS.GRADES);

export async function listGrades(filters?: {
  studentId?: string;
  examType?: string;
  subject?: string;
}): Promise<ExamResult[]> {
  const conditions: string[] = [];
  const parameters: { name: string; value: string }[] = [];

  if (filters?.studentId) {
    conditions.push("c.studentId = @studentId");
    parameters.push({ name: "@studentId", value: filters.studentId });
  }
  if (filters?.examType) {
    conditions.push("c.examType = @examType");
    parameters.push({ name: "@examType", value: filters.examType });
  }
  if (filters?.subject) {
    conditions.push("c.subject = @subject");
    parameters.push({ name: "@subject", value: filters.subject });
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM c ${where} ORDER BY c.date DESC`;

  const { resources } = await container().items
    .query({ query, parameters })
    .fetchAll();

  return resources as ExamResult[];
}

export async function getGrade(id: string, studentId: string): Promise<ExamResult | null> {
  try {
    const { resource } = await container().item(id, studentId).read<ExamResult>();
    return resource ?? null;
  } catch {
    return null;
  }
}

export async function createGrade(input: ExamResultCreateInput): Promise<ExamResult> {
  const now = new Date().toISOString();
  const grade: ExamResult = {
    ...input,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { resource } = await container().items.create(grade);
  return resource as ExamResult;
}

export async function updateGrade(
  id: string,
  studentId: string,
  input: ExamResultUpdateInput
): Promise<ExamResult | null> {
  const existing = await getGrade(id, studentId);
  if (!existing) return null;

  const updated: ExamResult = {
    ...existing,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container().item(id, studentId).replace(updated);
  return resource as ExamResult;
}

export async function deleteGrade(id: string, studentId: string): Promise<boolean> {
  try {
    await container().item(id, studentId).delete();
    return true;
  } catch {
    return false;
  }
}

export async function getStudentGradeSummary(
  studentId: string
): Promise<{ subject: string; averageScore: number; count: number }[]> {
  const query = `
    SELECT
      c.subject,
      AVG(c.score / c.maxScore * 100) AS averageScore,
      COUNT(1) AS count
    FROM c
    WHERE c.studentId = @studentId
    GROUP BY c.subject
  `;
  const parameters = [{ name: "@studentId", value: studentId }];

  const { resources } = await container().items
    .query({ query, parameters })
    .fetchAll();

  return resources as { subject: string; averageScore: number; count: number }[];
}
