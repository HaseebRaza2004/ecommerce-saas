import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { BRAND_CONFIG } from "@/config/brand.config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.consoleLabel}`,
  description: BRAND_CONFIG.subtitle,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="nordic-teal"
      data-mode="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}