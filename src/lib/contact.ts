/**
 * BELOVI company details, in one place.
 */

/**
 * Statutory company identity. The Consumer Protection (E-Commerce) Rules, 2020
 * require the legal name, registered address and a working grievance contact to
 * be displayed, which is why these live in the footer rather than only in the
 * Terms page.
 *
 * Supply the real BELOVI legal entity details when available.
 */
export const COMPANY = {
  legalName: "BELOVI Private Limited",
  cin: "[TO BE CONFIRMED]",
  registeredOffice:
    "[TO BE CONFIRMED]",
  /** Exclusive jurisdiction. */
  jurisdiction: "[TO BE CONFIRMED]",
} as const;

/** Customer care email address. */
export const CARE_EMAIL = "care@belovi.in";
