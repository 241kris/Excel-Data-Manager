import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ SEO amélioré
export const metadata: Metadata = {
  title: "Excel Data Manager",
  description: "Gérez vos fichiers Excel facilement via une interface web moderne.",
  keywords: ["Excel", "Data Management", "Next.js", "MySQL", "React", "xlsx"],
  authors: [{ name: "Ton Nom", url: "https://tonsite.com" }],
  creator: "Ton Nom",
  metadataBase: new URL("https://tonsite.com"),
  openGraph: {
    title: "Excel Data Manager",
    description: "Importez, modifiez et exportez vos fichiers Excel en toute simplicité.",
    url: "https://tonsite.com",
    siteName: "Excel Data Manager",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excel Data Manager",
    description: "Gérez facilement vos fichiers Excel avec une interface moderne.",
    creator: "@tonpseudo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="abyss">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
