import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Header } from "@/components/Header";


export const metadata: Metadata = {
  title: "Chariot - Luxury Jewelry & Design",
  description: "Discover our exquisite collection of handcrafted jewelry and design services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen`}>
        <Header />
        <main className="pt-[120px]">
          {children}
        </main>
      </body>
    </html>
  );
}
