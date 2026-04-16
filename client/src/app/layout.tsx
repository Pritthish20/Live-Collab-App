import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabPad",
  description: "Real-time collaborative document editor"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="app-shell">
            <Navbar />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
