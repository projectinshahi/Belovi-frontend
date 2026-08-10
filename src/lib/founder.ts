export interface FounderNote {
  eyebrow: string;
  heading: string;
  body1: string;
  body2: string;
  signature: string;
  image: string;
}

/** Fetch the editable Founder's Note. null on failure → component uses its defaults. */
export async function fetchFounderNote(): Promise<FounderNote | null> {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
    const res = await fetch(`${base}/api/v1/founder-note`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
