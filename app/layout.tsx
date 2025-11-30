import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import LoadingBar from "@/components/LoadingBar";
import PageTransitionEffect from "@/components/PageTransitionEffect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VexaStore - Modern E-commerce Platform",
  description: "A modern e-commerce platform. Shop the latest products with secure payments and fast delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <LoadingBar />
            <PageTransitionEffect />
            <div className="flex flex-col min-h-screen relative z-10">
              <Header />
              <main className="flex-1">
                <PageTransitionWrapper>
                  {children}
                </PageTransitionWrapper>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
