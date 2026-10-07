import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hall & Hostel Management System",
  description: "Hostel resident and dues management system with printable 3-part receipt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
