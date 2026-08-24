// Layout raíz: fuente Geist, idioma español y metadatos base del sitio.
// El tema crema/rojo vive en globals.css (tokens + @theme inline de Tailwind 4).
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://menu-digital-utap.vercel.app"),
  title: "Utap · Menú",
  description: "Menú digital de los productos",
  openGraph: {
    title: "Utap · Menú digital",
    description: "Menú digital de los productos",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Utap" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Utap · Menú digital",
    description: "Menú digital de los productos",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
