import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Anton } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Kit.GG - League of Legends Account <Search></Search>",
  description:
    "Search League of Legends accounts for ranked stats, champion mastery, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body
        className={`${poppins.variable} ${anton.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col bg-[#F5F2EC] text-stone-800 transition-colors duration-300 dark:bg-night-950 dark:text-gold-300">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#F5F2EC] dark:bg-night-950" />
            <div className="absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-gold-400/15 blur-3xl dark:bg-gold-400/10" />
            <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-500/[0.06]" />
          </div>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6 md:px-6 md:pt-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
