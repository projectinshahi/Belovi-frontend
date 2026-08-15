import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

/**
 * Display face, per the Figma home frame — the hero sets it at 700/94px
 * uppercase, section headings at 500/56px.
 */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  // 200 is the home hero and 300 the rest of the display type: both are set
  // light, so both faces have to be loaded or the browser synthesises them from
  // 400 and the strokes come out uneven. Asking for a weight that was never
  // loaded is not an error — it silently renders as the nearest one that was,
  // which is how a thinner headline turns into no change at all.
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * UI/body face. Figma specifies Gordita, which needs a commercial licence;
 * Poppins is the agreed stand-in — same geometric sans construction and a near
 * match at the 18px body size the design leans on. Only this file names it, so
 * dropping in a licensed Gordita later means editing one declaration.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://belovi.in'),
  title: {
    absolute: "BELOVI — Made for Moments Together",
  },
  description:
    "Premium luxury wellness & intimacy lifestyle brand. Luxury tantra furniture, couple wellness, yoga & meditation products. Crafted for connection, comfort, and elegance.",
  openGraph: {
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BELOVI — Made for Moments Together'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-image.png'],
  },
};

import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "../context/ToastContext";
import { SettingsProvider } from "../context/SettingsContext";
import GoogleOAuthWrapper from "../components/auth/GoogleOAuthWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-ivory text-ink" suppressHydrationWarning>
        <ToastProvider>
          <SettingsProvider>
            <CartProvider>
              <GoogleOAuthWrapper>
                <Navbar />
                {children}
                <Footer />
              </GoogleOAuthWrapper>
            </CartProvider>
          </SettingsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

