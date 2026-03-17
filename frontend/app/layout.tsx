import type { Metadata } from "next";

import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import { AuthProvider } from "@/components/Providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Persona AI - Connect with AI Companions",
  description: "Experience deep, realistic conversations with personalized AI personas that remember you and grow with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans dark", inter.variable)}>
      <body
        className={`antialiased`}
      >
        <BackgroundAnimation />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
