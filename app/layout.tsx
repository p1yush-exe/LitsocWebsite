import type { Metadata } from "next";
import { Antonio } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
});

const proximaNova = localFont({
  src: "../public/Proxima Nova Regular.ttf",
  variable: "--font-proxima-nova",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Literary Society, TIET",
  description: "Official website of the Literary Society, Thapar Institute of Engineering & Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Disable browser scroll restoration so the page always starts at the top */}
        <script
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration='manual';window.scrollTo(0,0);`,
          }}
        />
      </head>
      <body
        className={`${antonio.variable} ${proximaNova.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
