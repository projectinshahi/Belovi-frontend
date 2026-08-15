import ProductBrowser from "../../../components/shop/ProductBrowser";

/**
 * The fourth edit section. Everything else already pointed here — the tile on
 * /the-edit, the `furniture` label in Breadcrumbs, the edit-section description
 * key in ProductBrowser, and `BELOVI Men` in the backend's `editSection` enum —
 * but the route itself did not exist, so the tile was a 404.
 *
 * `sectionSlugs` carries both spellings: pieces are filed under the enum's
 * "BELOVI Men" while the slug in the URL is `furniture`, and the browser matches
 * on either, so a piece is reachable however it was filed.
 */
export default function FurniturePage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["furniture", "belovi-men"], modeSlugs: [] }}
      heading={{
        eyebrow: "The Edit · BELOVI Man",
        title: "BELOVI Man",
        description:
          "Considered pieces for the spaces a man actually lives in — sculptural form, honest materials, and comfort that holds up to daily use.",
      }}
    />
  );
}
