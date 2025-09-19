import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import FCMBridge from "../components/FCMBridge";
import { PhaseProvider } from "../context/PhaseContext";
import PhaseTransition from "../components/PhaseTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🦉 CH Demo | ACM-VIT",
  description: "Try out Cryptic Hunt by ACM-VIT",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
  openGraph: {
    title: "🦉 CH Demo | ACM-VIT",
    description: "Try out Cryptic Hunt by ACM-VIT",
    images: ["/opengraph.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🦉 CH Demo | ACM-VIT",
    description: "Try out Cryptic Hunt by ACM-VIT",
    images: ["/opengraph.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <PhaseProvider>
            {children}
            <PhaseTransition />
            <FCMBridge />
            <NavBar />
          </PhaseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
