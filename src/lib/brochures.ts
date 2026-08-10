import { apiBase } from "./story";

/** A downloadable brochure / lookbook, as published from the studio. */
export interface Brochure {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  coverImage?: string;
  fileSize?: number;
  order: number;
  status: "DRAFT" | "PUBLISHED";
}

/**
 * Published brochures in display order.
 *
 * Never rejects: a brochure strip is an enhancement, and an unreachable backend
 * should collapse the section rather than take the homepage down with it.
 */
export async function fetchBrochures(opts?: { noStore?: boolean }): Promise<Brochure[]> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/brochures`, {
      cache: opts?.noStore ? "no-store" : "default",
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return [];
    return (json.data as Brochure[]).filter((b) => b.status === "PUBLISHED" && b.fileUrl);
  } catch {
    return [];
  }
}

/** "2.4 MB" — omitted entirely when the size wasn't recorded. */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
