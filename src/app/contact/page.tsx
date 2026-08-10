import type { Metadata } from "next";
import { fetchAbout } from "../../lib/about";
import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact — BELOVI",
  description:
    "Speak to BELOVI — WhatsApp, email, telephone and showroom details for orders, returns and enquiries.",
};

export default async function ContactPage() {
  // The showroom block reuses the About singleton rather than duplicating an
  // address the studio would then have to keep in step in two places.
  const about = await fetchAbout({ noStore: true });
  return <ContactClient about={about} />;
}
