import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bullseye Revenue - GTM Intelligence Dashboard",
  description: "View-only GTM intelligence dashboard for sales and marketing teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
