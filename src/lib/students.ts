import { v4 as uuidv4 } from "uuid";
import { getContainer, CONTAINERS } from "@/lib/cosmos";
import type {
  Student,
  StudentCreateInput,
  StudentUpdateInput,
} from "@/lib/types";

const container = () => getContainer(CONTAINERS.STUDENTS);

export async function listStudents(filters?: {
  gradeLevel?: string;
  enrollmentStatus?: string;
}): Promise<Student[]> {
  const conditions: string[] = [];
  const parameters: { name: string; value: string }[] = [];

  if (filters?.gradeLevel) {
    conditions.push("c.gradeLevel = @gradeLevel");
    parameters.push({ name: "@gradeLevel", value: filters.gradeLevel });
  }
  if (filters?.enrollmentStatus) {
    conditions.push("c.enrollmentStatus = @enrollmentStatus");
    parameters.push({
      name: "@enrollmentStatus",
      value: filters.enrollmentStatus,
    });
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM c ${where} ORDER BY c.lastNameKana, c.firstNameKana`;

  const { resources } = await container().items
    .query({ query, parameters })
    .fetchAll();

  return resources as Student[];
}

export async function getStudent(id: string, gradeLevel: string): Promise<Student | null> {
  try {
    const { resource } = await container().item(id, gradeLevel).read<Student>();
    return resource ?? null;
  } catch {
    return null;
  }
}

export async function createStudent(input: StudentCreateInput): Promise<Student> {
  const now = new Date().toISOString();
  const student: Student = {
    ...input,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { resource } = await container().items.create(student);
  return resource as Student;
}

export async function updateStudent(
  id: string,
  gradeLevel: string,
  input: StudentUpdateInput
): Promise<Student | null> {
  const existing = await getStudent(id, gradeLevel);
  if (!existing) return null;

  const updated: Student = {
    ...existing,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container().item(id, gradeLevel).replace(updated);
  return resource as Student;
}

export async function deleteStudent(id: string, gradeLevel: string): Promise<boolean> {
  try {
    await container().item(id, gradeLevel).delete();
    return true;
  } catch {
    return false;
  }
}
