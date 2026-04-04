import { v4 as uuidv4 } from "uuid";
import { getContainer, CONTAINERS } from "@/lib/cosmos";
import type {
  AbsenceRecord,
  AbsenceCreateInput,
  AbsenceUpdateInput,
} from "@/lib/types";

const container = () => getContainer(CONTAINERS.ABSENCES);

export async function listAbsences(filters?: {
  studentId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AbsenceRecord[]> {
  const conditions: string[] = [];
  const parameters: { name: string; value: string }[] = [];

  if (filters?.studentId) {
    conditions.push("c.studentId = @studentId");
    parameters.push({ name: "@studentId", value: filters.studentId });
  }
  if (filters?.status) {
    conditions.push("c.status = @status");
    parameters.push({ name: "@status", value: filters.status });
  }
  if (filters?.dateFrom) {
    conditions.push("c.originalDate >= @dateFrom");
    parameters.push({ name: "@dateFrom", value: filters.dateFrom });
  }
  if (filters?.dateTo) {
    conditions.push("c.originalDate <= @dateTo");
    parameters.push({ name: "@dateTo", value: filters.dateTo });
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM c ${where} ORDER BY c.originalDate DESC`;

  const { resources } = await container().items
    .query({ query, parameters })
    .fetchAll();

  return resources as AbsenceRecord[];
}

export async function getAbsence(id: string, studentId: string): Promise<AbsenceRecord | null> {
  try {
    const { resource } = await container().item(id, studentId).read<AbsenceRecord>();
    return resource ?? null;
  } catch {
    return null;
  }
}

export async function createAbsence(input: AbsenceCreateInput): Promise<AbsenceRecord> {
  const now = new Date().toISOString();
  const record: AbsenceRecord = {
    ...input,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { resource } = await container().items.create(record);
  return resource as AbsenceRecord;
}

export async function updateAbsence(
  id: string,
  studentId: string,
  input: AbsenceUpdateInput
): Promise<AbsenceRecord | null> {
  const existing = await getAbsence(id, studentId);
  if (!existing) return null;

  const updated: AbsenceRecord = {
    ...existing,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container().item(id, studentId).replace(updated);
  return resource as AbsenceRecord;
}

export async function deleteAbsence(id: string, studentId: string): Promise<boolean> {
  try {
    await container().item(id, studentId).delete();
    return true;
  } catch {
    return false;
  }
}
