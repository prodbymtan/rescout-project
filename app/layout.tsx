import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReScout - FRC Scouting System by Team HYPER",
  description: "Accurate match scouting for FIRST Robotics Competition",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
