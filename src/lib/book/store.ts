import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { BOOK_STORE_RELATIVE, type BookRequest } from "@/lib/book/types";

export type StoredBookRequest = BookRequest & {
  delivery: "local";
  userAgent?: string;
};

export function bookStorePath(): string {
  return path.join(process.cwd(), BOOK_STORE_RELATIVE);
}

export async function persistBookLocal(
  request: BookRequest,
  extra?: { userAgent?: string },
): Promise<string> {
  const file = bookStorePath();
  await mkdir(path.dirname(file), { recursive: true });
  const row: StoredBookRequest = {
    ...request,
    delivery: "local",
    dispatched: false,
    userAgent: extra?.userAgent?.slice(0, 180),
  };
  await appendFile(file, `${JSON.stringify(row)}\n`, "utf8");
  return file;
}
