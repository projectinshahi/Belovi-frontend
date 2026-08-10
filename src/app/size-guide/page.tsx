import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LegalPage from "../../components/common/LegalPage";
import SizeChart from "../../components/ui/SizeChart";
import { fetchProductById } from "../../lib/product";

// The chart belongs to whichever piece ?product= names, so there is nothing
// stable to prerender.
export const dynamic = "force-dynamic";

/** `?product=` may arrive repeated; only a single id means anything here. */
const readId = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const id = readId((await searchParams).product);
  const product = id ? await fetchProductById(id) : null;

  return product
    ? {
        description: `Body measurements and fit notes for ${product.name}.`,
      }
    : {
        description:
          "How to measure, and the fit notes behind every BELOVI piece.",
      };
}

export default async function SizeGuidePage({ searchParams }: Props) {
  const id = readId((await searchParams).product);
  const product = id ? await fetchProductById(id) : null;
  const rows = product?.sizeChart ?? [];

  return (
    <LegalPage eyebrow="Customer Care" title="Size Guide">
      {product ? (
        <p>
          Measurements for{" "}
          <Link href={`/products/${product._id}`}>
            <strong>{product.name}</strong>
          </Link>
          . Every piece is drafted to its own pattern, so this chart belongs to
          this piece alone. It lists body measurements, not garment measurements —
          measure yourself over light clothing and pick the size that matches your
          largest reading.
        </p>
      ) : (
        <p>
          Our clothing is drafted for real bodies and tropical weather, with room
          to move and breathe. Each piece carries its own chart rather than one
          house-wide table — open a piece and follow{" "}
          <strong>Find your size</strong> to see the measurements drafted for it.
          Everything below applies whichever piece you are sizing.
        </p>
      )}

      {rows.length > 0 && (
        <>
          <h2>Body measurements</h2>
          <SizeChart rows={rows} />
        </>
      )}

      {product && rows.length === 0 && (
        <p>
          A chart for this piece has not been published yet. Message us on
          WhatsApp with your measurements and we will size it for you.
        </p>
      )}

      <h2>How to measure</h2>
      {/* Two columns from lg up; tablet and phone stack, diagram last. The
          A / B / C prefixes are what make the letters on the diagram mean
          something — they are a pair, not decoration. */}
      <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-12 lg:items-start">
        <ul>
          <li>
            <strong>A · Bust</strong> — around the fullest part of your chest,
            tape level and not pulled tight.
          </li>
          <li>
            <strong>B · Waist</strong> — around the narrowest part of your torso,
            above the navel and below the rib cage.
          </li>
          <li>
            <strong>C · Hip</strong> — feet together, around the fullest part of
            your seat, roughly 20 cm below the waist.
          </li>
          <li>
            <strong>Length</strong> — from the highest point of the shoulder
            straight down.
          </li>
        </ul>

        {/* Referenced by public path, not imported.
            `import … from "../../../public/…"` resolves the file at build time,
            so when the diagram is missing the import fails and takes the WHOLE
            SITE's build down with it — which is what it was doing. A `src`
            string is resolved by the browser, so an absent diagram costs this
            one illustration and nothing else.

            The source PNG is line art on a white ground, so `mix-blend-multiply`
            drops the ground and leaves the strokes on the page's ivory. Only
            works because this page is light; a dark panel would need a real
            transparent PNG. */}
        <Image
          src="/images/size-guide-measure.png"
          alt="Body diagram marking A at the bust, B at the waist and C at the hip."
          width={300}
          height={420}
          sizes="(max-width: 1024px) 260px, 300px"
          className="w-[260px] lg:w-full h-auto mx-auto mix-blend-multiply"
        />
      </div>

      <h2>Fit notes</h2>
      <ul>
        <li>
          Most of our silhouettes are relaxed and drape away from the body. If you
          are between sizes and prefer a closer fit, size down.
        </li>
        <li>
          Structured pieces such as shirt-dresses run truer to the chart; follow
          your bust reading for these.
        </li>
        <li>
          Natural fabrics like cotton and linen may relax by half a size with wear
          and settle back after a wash.
        </li>
        <li>
          Each product page carries its own fit note and the height of the model
          in the photographs for reference.
        </li>
      </ul>

      <h2>Still unsure?</h2>
      <p>
        Share your measurements with us on WhatsApp and we will recommend a size.
        We would rather help you get it right the first time than process an
        exchange later.
      </p>
    </LegalPage>
  );
}
