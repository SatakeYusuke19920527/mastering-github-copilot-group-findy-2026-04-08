import { v4 as uuidv4 } from "uuid";
import { getContainer, CONTAINERS } from "@/lib/cosmos";
import type {
  BillingRecord,
  BillingCreateInput,
  BillingUpdateInput,
} from "@/lib/types";

const container = () => getContainer(CONTAINERS.BILLING);

export async function listBillingRecords(filters?: {
  studentId?: string;
  status?: string;
  billingMonth?: string;
}): Promise<BillingRecord[]> {
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
  if (filters?.billingMonth) {
    conditions.push("c.billingMonth = @billingMonth");
    parameters.push({ name: "@billingMonth", value: filters.billingMonth });
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM c ${where} ORDER BY c.billingMonth DESC, c.studentName`;

  const { resources } = await container().items
    .query({ query, parameters })
    .fetchAll();

  return resources as BillingRecord[];
}

export async function getBillingRecord(
  id: string,
  studentId: string
): Promise<BillingRecord | null> {
  try {
    const { resource } = await container().item(id, studentId).read<BillingRecord>();
    return resource ?? null;
  } catch {
    return null;
  }
}

export async function createBillingRecord(
  input: BillingCreateInput
): Promise<BillingRecord> {
  const now = new Date().toISOString();
  const record: BillingRecord = {
    ...input,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { resource } = await container().items.create(record);
  return resource as BillingRecord;
}

export async function updateBillingRecord(
  id: string,
  studentId: string,
  input: BillingUpdateInput
): Promise<BillingRecord | null> {
  const existing = await getBillingRecord(id, studentId);
  if (!existing) return null;

  const updated: BillingRecord = {
    ...existing,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container().item(id, studentId).replace(updated);
  return resource as BillingRecord;
}

export async function deleteBillingRecord(
  id: string,
  studentId: string
): Promise<boolean> {
  try {
    await container().item(id, studentId).delete();
    return true;
  } catch {
    return false;
  }
}
