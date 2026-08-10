import React from "react";

export type StorySectionType =
  | "hero"
  | "founders-note"
  | "text"
  | "image"
  | "gallery"
  | "quote"
  | "timeline"
  | "cta";

export interface TimelineItem {
  label: string;
  text: string;
}

export interface StorySection {
  _id: string;
  type: StorySectionType;
  eyebrow?: string;
  title?: string;
  body?: string;
  tagline?: string;
  image?: string;
  images?: string[];
  imageAlt?: string;
  imageLeft?: boolean;
  quote?: string;
  quoteAuthor?: string;
  timeline?: TimelineItem[];
  ctaLabel?: string;
  ctaHref?: string;
  order: number;
  status: "DRAFT" | "PUBLISHED";
}

export interface StorySettings {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  introEyebrow?: string;
  introHeading?: string;
  introDescription?: string;
}

export interface StoryPayload {
  sections: StorySection[];
  settings: StorySettings;
}

/** Backend origin without the trailing /api, matching the rest of the storefront. */
export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
}

/** Fetch the published Story feed. Returns null on any failure (caller falls back). */
export async function fetchStory(opts?: { noStore?: boolean }): Promise<StoryPayload | null> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/story`, {
      cache: opts?.noStore ? "no-store" : "default",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data || !Array.isArray(data.sections)) return null;
    return { sections: data.sections, settings: data.settings || {} };
  } catch {
    return null;
  }
}

/**
 * Render admin-entered body copy as React nodes. Paragraphs split on blank
 * lines; inside a paragraph `**bold**` and `*italic*` are honoured and single
 * newlines become line breaks. No raw HTML is injected, so admin input is safe.
 */
export function renderRichText(body?: string): React.ReactNode[] {
  if (!body) return [];
  const paragraphs = body.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para, pi) =>
      React.createElement(
        "p",
        { key: pi, className: "font-sans text-[15px] leading-[1.85] text-muted" },
        renderInline(para)
      )
    );
}

/** Inline **bold** / *italic* / line breaks → React nodes. */
function renderInline(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  lines.forEach((line, li) => {
    if (li > 0) out.push(React.createElement("br", { key: `br-${li}` }));
    // Tokenize **bold** and *italic*.
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
    parts.forEach((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        out.push(React.createElement("strong", { key: `${li}-${i}`, className: "text-ink font-medium" }, part.slice(2, -2)));
      } else if (/^\*[^*]+\*$/.test(part)) {
        out.push(React.createElement("em", { key: `${li}-${i}` }, part.slice(1, -1)));
      } else {
        out.push(part);
      }
    });
  });
  return out;
}
