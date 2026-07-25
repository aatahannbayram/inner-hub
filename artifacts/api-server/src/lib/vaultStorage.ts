import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "application/octet-stream",
]);

function storageRoot(): string {
  const raw = process.env.VAULT_STORAGE_DIR?.trim();
  if (raw) return path.resolve(raw);
  return path.resolve(process.cwd(), "data", "vault");
}

function safeExt(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  if (!ext || ext.length > 12) return ".bin";
  return ext;
}

export function vaultMaxBytes() {
  return MAX_BYTES;
}

export function isAllowedVaultMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime.toLowerCase());
}

export async function saveVaultFile(
  userId: number,
  originalName: string,
  buffer: Buffer,
): Promise<{ fileKey: string; sizeBytes: number }> {
  if (buffer.length === 0) throw new Error("Boş dosya");
  if (buffer.length > MAX_BYTES) throw new Error("Dosya en fazla 12 MB olabilir");

  const root = storageRoot();
  const userDir = path.join(root, String(userId));
  await fs.mkdir(userDir, { recursive: true });

  const key = `${Date.now()}-${randomBytes(6).toString("hex")}${safeExt(originalName)}`;
  const abs = path.join(userDir, key);
  await fs.writeFile(abs, buffer);
  return { fileKey: `${userId}/${key}`, sizeBytes: buffer.length };
}

export async function readVaultFile(fileKey: string): Promise<Buffer> {
  const root = storageRoot();
  const normalized = path.normalize(fileKey).replace(/^(\.\.(\/|\\|$))+/, "");
  if (normalized.includes("..")) throw new Error("Geçersiz dosya anahtarı");
  const abs = path.join(root, normalized);
  if (!abs.startsWith(root)) throw new Error("Geçersiz dosya yolu");
  return fs.readFile(abs);
}

export async function deleteVaultFile(fileKey: string | null | undefined): Promise<void> {
  if (!fileKey) return;
  try {
    const root = storageRoot();
    const normalized = path.normalize(fileKey).replace(/^(\.\.(\/|\\|$))+/, "");
    const abs = path.join(root, normalized);
    if (!abs.startsWith(root)) return;
    await fs.unlink(abs);
  } catch {
    /* missing file ok */
  }
}
