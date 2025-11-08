import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Plant Selling - Beautiful Plants for Your Home",
    template: "%s | Plant Selling",
  },
  description: "Discover a wide variety of beautiful plants for your home and garden. Shop indoor, outdoor, succulents, and more with expert care instructions.",
  keywords: ["plants", "indoor plants", "outdoor plants", "succulents", "garden", "plant care"],
  authors: [{ name: "Plant Selling" }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    siteName: "Plant Selling",
    title: "Plant Selling - Beautiful Plants for Your Home",
    description: "Discover a wide variety of beautiful plants for your home and garden",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plant Selling - Beautiful Plants for Your Home",
    description: "Discover a wide variety of beautiful plants for your home and garden",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

