import ProductBrowser from "../../../components/shop/ProductBrowser";

export default function ArchivePage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["archive"], modeSlugs: [] }}
      heading={{
        eyebrow: "The Edit · Archive",
        title: "Archive",
        description:
          "Past seasons and retired placements, kept in circulation while they last. The pieces that defined a chapter, gathered here before they close for good.",
      }}
    />
  );
}
