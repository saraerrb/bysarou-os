import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "BySarou OS — COD Commerce Operating System",
  description:
    "Centralize, automate, and optimize your Cash-On-Delivery e-commerce operations.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSerif.variable}`} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
