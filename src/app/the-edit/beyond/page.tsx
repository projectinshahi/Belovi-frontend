import ProductBrowser from "../../../components/shop/ProductBrowser";

export default function BeyondPage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["beyond"], modeSlugs: ["ambition", "occasion", "casual-out"] }}
      heading={{
        eyebrow: "The Edit · Beyond",
        title: "Beyond",
        description:
          "For the life lived outward — ambition, occasion, the casual day out. Pieces built to move with you past the front door and hold their line all the way through.",
      }}
    />
  );
}
