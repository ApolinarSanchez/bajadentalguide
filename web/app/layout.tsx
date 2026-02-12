import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BajaDentalGuide",
  description: "Find dental clinics in Baja California",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
