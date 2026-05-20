import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sportdagar – Boka sportaktiviteter för barn",
  description:
    "Sportdagar är plattformen där föräldrar kan anmäla sina barn till lokala sportprova-på-dagar och aktivitetsveckor.",
  keywords: "sport, barn, aktiviteter, fotboll, handboll, basket, sportdagar",
  openGraph: {
    title: "Sportdagar",
    description: "Boka sportaktiviteter för dina barn",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
