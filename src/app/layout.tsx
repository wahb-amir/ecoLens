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
