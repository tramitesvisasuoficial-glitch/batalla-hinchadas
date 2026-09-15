import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <footer style={{ textAlign: "center", padding: "24px", marginTop: "auto", borderTop: "1px solid #1e293b", fontSize: "0.85rem", color: "#64748b" }}>
            <p style={{ marginBottom: "12px" }}>© {new Date().getFullYear()} Batalla de Hinchadas. Todos los derechos reservados.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
              <a href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Términos y Condiciones</a>
              <a href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacidad</a>
              <a href="/refunds" style={{ color: "#94a3b8", textDecoration: "none" }}>Reembolsos</a>
              <a href="/contact" style={{ color: "#94a3b8", textDecoration: "none" }}>Contacto</a>
            </div>
          </footer>
        </div>
        <Script src="https://checkout.epayco.co/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
