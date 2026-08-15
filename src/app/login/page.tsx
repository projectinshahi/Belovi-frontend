import { permanentRedirect } from "next/navigation";

/**
 * `/login` rendered `null` — a blank white screen under the nav, reachable by
 * anyone who guessed the URL or kept an old bookmark. The real page is
 * /sign-in; this forwards to it rather than dead-ending.
 */
export default function LoginPage() {
  permanentRedirect("/sign-in");
}
