"use client";

import Image from "next/image";

export default function Hero()
{
    return(
        <section className="bg-main-bg">
            <div className="hero-container">
               <Image 
               alt="background"
               src="/Litsoc.jpg"
               fill
               className="object-cover object-center z-0"/>
               <div className="hero-content">
                   <div className="overflow-hidden">
                       <h1 className="hero-title">
                           Literary Society
                       </h1>
                   </div>
                   <div 
                   style={{
                    clipPath:"polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",}} className="hero-text-scroll">

                   </div>
               </div>
            </div>
        </section>
    );
}