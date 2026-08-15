export interface MomentStep {
  number: string;
  title: string;
  description: string;
}

/**
 * Header copy for The Moment's product showcase. Membership isn't listed here —
 * a piece is in The Moment when its `category` is "The Moment".
 */
export interface SeasonalCollection {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface Moment {
  eyebrow: string;
  title: string;
  body: string;
  shopLabel: string;
  shopHref: string;
  explainerEyebrow: string;
  steps: MomentStep[];
  seasonal?: SeasonalCollection;
}

/**
 * The Moment section's content.
 *
 * There is NO `/api/v1/moment` endpoint — the backend has never had a Moment
 * route or model, and the admin has no editor for one. This used to fetch it
 * anyway: a request that 404s on every single page load, whose failure path
 * quietly returns null, so the page rendered its bundled defaults and nobody
 * ever saw the error.
 *
 * The defaults are now the honest answer. Restoring the CMS surface means a
 * Moment model, controller, route and admin editor — at which point this
 * becomes a real fetch again.
 */
export async function fetchMoment(): Promise<Moment | null> {
  return null;
}
