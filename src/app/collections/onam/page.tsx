import ProductBrowser from "../../../components/shop/ProductBrowser";

/**
 * The dedicated Onam Collection page — the same shop browser (sidebar filters,
 * sort, search, grid, responsive) scoped to the Onam collection. Products are
 * fetched client-side by ProductBrowser, so the page stays in sync with the
 * catalogue and the /the-moment grid (both filter on the collection tag).
 *
 * Kept sync — matching the /the-edit/* pages — deliberately: an async server
 * render around this client browser 500s.
 */
export default function OnamCollectionPage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["onam"], modeSlugs: [] }}
      heading={{ eyebrow: "Now · The Onam Collection", title: "The Onam Collection" }}
    />
  );
}
