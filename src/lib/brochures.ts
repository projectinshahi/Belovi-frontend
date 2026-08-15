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

/**
 * The same file, asked for as a DOWNLOAD rather than a page to view.
 *
 * The `download` attribute on an anchor is ignored cross-origin, and these PDFs
 * are served from Cloudinary — so left alone the browser opens the file in a tab
 * instead of saving it. Cloudinary's `fl_attachment` sets
 * `Content-Disposition: attachment` on delivery, which is the only thing that
 * actually makes it download; the optional name after the colon becomes the
 * saved filename, so a shopper gets "the-art-of-comfort.pdf" rather than
 * "brochure-1786104199027-668919488.pdf".
 *
 * Any URL that isn't a Cloudinary delivery URL is returned untouched — a
 * self-hosted PDF is same-origin, where the `download` attribute works by itself.
 */
export function brochureDownloadUrl(fileUrl: string, title?: string): string {
  if (!fileUrl.includes("res.cloudinary.com") || !fileUrl.includes("/upload/")) return fileUrl;

  const name = (title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return fileUrl.replace("/upload/", `/upload/${name ? `fl_attachment:${name}` : "fl_attachment"}/`);
}

/** "2.4 MB" — omitted entirely when the size wasn't recorded. */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
