import type { Metadata } from "next";
import { fetchAbout } from "../../lib/about";
import AboutClient from "./AboutClient";

// Always reflect the latest studio edits — no build-time caching of the content.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const about = await fetchAbout({ noStore: true });
  return {
    title: about?.metaTitle || "About Us — BELOVI",
    description:
      about?.metaDescription ||
      "The house behind BELOVI — company profile, vision, story and showroom.",
  };
}

export default async function AboutPage() {
  /* One feed. The StorySection list used to be fetched here and rendered
     mid-page; the redesign gives About its own story block, authored on the
     About singleton alongside the others. The feed itself is untouched and
     still drives /story. */
  const about = await fetchAbout({ noStore: true });

  return <AboutClient about={about} />;
}
