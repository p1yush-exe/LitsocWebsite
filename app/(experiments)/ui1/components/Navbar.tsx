"use client";

import Image from "next/image";

export default function Navbar(){
  return(
    <div className="fixed top-0 left-0 z-50 md:p-9 p-3 flex">
      <Image 
      alt="litsoc logo" 
      src="/logo.png"
      width={100}
      height={100}
      sizes= "max"
      />
    </div>
  )
}