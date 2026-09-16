import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Batalla de Hinchadas",
  description: "Apoya a tu equipo en la Batalla de Hinchadas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div style={{ background: "#f59e0b", color: "#000", textAlign: "center", padding: "8px", fontSize: "0.85rem", fontWeight: "bold" }}>
          ENTORNO DE PRUEBA — Los pagos realizados aquí utilizan el modo Sandbox y no representan cobros reales.
        </div>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </div>
        <Script src="https://checkout.epayco.co/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
