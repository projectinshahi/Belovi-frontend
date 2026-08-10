import { permanentRedirect } from "next/navigation";

/**
 * The Story page is now a block inside About Us, so the story is authored and
 * read in one place. This keeps old links, shared URLs and search results
 * working — the studio's Story Page editor still feeds it, it just renders at
 * /about now.
 */
export default function StoryPage() {
  permanentRedirect("/about");
}
