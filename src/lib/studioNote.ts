export interface StudioNote {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Fetch the editable Studio Notes block. null on failure → component uses defaults. */
export async function fetchStudioNote(): Promise<StudioNote | null> {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
    const res = await fetch(`${base}/api/v1/studio-note`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
