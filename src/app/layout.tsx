// app/layout.tsx
import { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "./providers/AuthProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "EcoLens",
  description: "Classify waste. Track impact. Save the planet.",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-green-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-green-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-green-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon_io/favicon-green-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon_io/favicon-green-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon_io/favicon-green-256x256.png", sizes: "256x256", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-body antialiased`}>
        <AuthProvider initialUser={null}>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
