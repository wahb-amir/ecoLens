// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/AppLayout";
import { cookies } from "next/headers";
import { AuthProvider } from "./providers/AuthProvider";
export const metadata: Metadata = {
  title: "EcoLens",
  description: "Classify waste. Track impact. Save the planet.",
};

type User = {
  id?: string;
  email?: string;
  role?: string;
  // add any other minimal fields your app needs
} | null;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: User = null;

  try {
    // read cookies from incoming request
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString(); // like "cookie1=..; cookie2=.."


    const res = await fetch(`${process.env.BACKEND_URL}/api/user/me`, {
      method: "GET",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      // ensure we always fetch fresh auth state for this request
      cache: "no-store",
    });

    if (res.ok) {
      // parse user shape your backend returns
      user = await res.json();
    } else {
      user = null;
    }
  } catch (err) {
    // swallow errors here: treat as unauthenticated (you can log server-side)
    user = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {/* pass initialUser down to AppLayout */}
        <AuthProvider initialUser={user}>
          <AppLayout initialUser={user}>{children}</AppLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
