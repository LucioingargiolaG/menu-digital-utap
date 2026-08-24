// Layout raíz del panel de gestión (login + panel).
// Solo aporta metadata: previews con la marca cuando se comparte el link,
// y noindex para que el panel no aparezca en buscadores.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utap · Admin",
  description: "Panel de administración del menú digital de Utap",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Utap · Admin",
    description: "Panel de administración del menú digital de Utap",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Utap" }],
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
