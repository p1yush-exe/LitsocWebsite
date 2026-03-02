import Image from "next/image";
import Hero from "./sections/Hero";

export default function UI1() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <Hero />
    </main>
  );
}
