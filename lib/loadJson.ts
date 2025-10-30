import fs from "fs/promises";
import path from "path";

export async function loadPublicJson<T = unknown>(relativePath: string): Promise<T> {
  const file = path.join(process.cwd(), "public", relativePath);
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as T;
}
