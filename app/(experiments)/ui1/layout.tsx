import type { Metadata } from "next";
import { Antonio } from "next/font/google";
import localFont from "next/font/local";
import "./ui1.css";
import Navbar from "./components/Navbar";

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
});

const proximaNova = localFont({
  src: "../../../public/Proxima Nova Regular.ttf",
  variable: "--font-proxima-nova",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Literary Society, TIET",
  description: "Official website of the Literary Society, Thapar Institute of Engineering & Technology",
};

export default function UI1Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${antonio.variable} ${proximaNova.variable}`}>
      <Navbar />
      {children}
    </div>
  );
}
