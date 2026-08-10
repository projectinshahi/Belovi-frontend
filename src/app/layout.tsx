import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${inter.variable} ${cormorant.variable} ${geistMono.variable} h-full antialiased`}
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

