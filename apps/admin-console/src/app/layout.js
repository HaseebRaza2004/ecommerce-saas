import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { I18nProvider } from "@/context/I18nContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Enterprise SaaS Admin Console | Command Center",
  description: "Zero-Trust Multi-Tenant E-Commerce Merchant & Staff Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <AuthProvider>{children}</AuthProvider>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}