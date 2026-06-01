import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NASA Explorer | Interactive Space Dashboard",
  description:
    "Explore the universe with NASA's free public APIs — APOD, Mars rovers, asteroids, Earth imagery, space weather, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} dark h-full bg-black`}
    >
      <body className="min-h-full bg-black text-neutral-100 antialiased">
        <QueryProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
