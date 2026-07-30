import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import { db } from "@/lib/db";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Blessing & Tessandra's Maroora",
    template: "%s | Blessing & Tessandra's Maroora",
  },
  description:
    "A private, invitation-only maroora celebration for Blessing Ngonidzashe Kaitano and Tessandra Chikomba — 24 October, Harare.",
  robots: {
    index: false,
    follow: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Maroora",
  },
};

export const viewport: Viewport = {
  themeColor: "#5c3a21",
  width: "device-width",
  initialScale: 1,
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

async function getThemeColors() {
  const fallback = { primary: "#5C3A21", secondary: "#EDE0D4" };
  try {
    const settings = await db.eventSettings.findUnique({ where: { id: "default" } });
    if (!settings) return fallback;
    return {
      primary: HEX_COLOR.test(settings.themePrimaryColor)
        ? settings.themePrimaryColor
        : fallback.primary,
      secondary: HEX_COLOR.test(settings.themeSecondaryColor)
        ? settings.themeSecondaryColor
        : fallback.secondary,
    };
  } catch {
    // DB not seeded/reachable yet (e.g. first boot before `npm run seed`) —
    // fall back to the default groom palette rather than crashing the app.
    return fallback;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeColors();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        {/* Runtime theme override: a superadmin editing colors at
            /admin/settings takes effect immediately, no redeploy. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--primary:${theme.primary};--secondary:${theme.secondary};}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
