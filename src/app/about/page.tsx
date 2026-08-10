import type { Metadata } from "next";
import { fetchAbout } from "../../lib/about";
import { fetchStory } from "../../lib/story";
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
  // Both feeds in parallel: the About singleton, and the story sections the
  // studio already maintains under Story Page.
  const [about, story] = await Promise.all([
    fetchAbout({ noStore: true }),
    fetchStory({ noStore: true }),
  ]);

  return <AboutClient about={about} story={story?.sections ?? []} />;
}
