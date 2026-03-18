"use client";
import { usePathname } from "next/navigation";
import {motion} from "framer-motion";

const navLinks = [
    { name: "Click This?", href: "/this" },
    { name: "Click This Too?", href: "/about" },
];

const Duration=0.25;
const Stagger=0.025;

const FlipLink = ({children,href}:{children:string,href:string}) => {
    const pathname = usePathname();
    const isActive = (pathname === href || (pathname.startsWith(href) && href !=="/"));
    return (
    <motion.a 
        variants={{
                initial: {},
                hovered: {},
            }}
        initial="initial"
        whileHover="hovered"
        href={href}
        style={{lineHeight:0.85}}
        className={`font-antonio font-black tracking-wide text-dark-brown
        relative bg-white block overflow-hidden whitespace-nowrap uppercase sm:text-2xl md:text-3xl lg:text-4xl 
        ${isActive ? "opacity-70": "opacity-100"}`} 
    >
    <div> 
        {children.split("").map((l,i)=>{
            return <motion.span 
            variants={{
                initial: {y:0,},
                hovered: {y:"-120%",},
            }}
            transition={{duration: Duration,
                ease:"easeInOut",
                delay:Stagger*i,
            }}
            className="inline-block"
            key={i}>{l}</motion.span>;
        })}
    </div>
    <div className="absolute inset-0"> 
        {children.split("").map((l,i)=>{
            return <motion.span 
            variants={{
                initial: {y: "100%",},
                hovered: {y: 0,},
            }}
            transition={{duration: Duration,
                ease:"easeInOut",
                delay:Stagger*i,
            }}
            className="inline-block"
            key={i}>{l}</motion.span>;
        })}
    </div>
    </motion.a>
    );  
};

export default function TextTest() {
    return (
        <main className="w-screen h-auto flex flex-col items-center justify-center gap-4 p-8">
            <h1 className="text-6xl font-bold font-antonio">
                Hello world!
            </h1>   
            {navLinks.map((link) => {
                return (
                    <FlipLink href={link.href}
                    key={link.name} >
                        {link.name}
                    </FlipLink>
                );
        })}
        </main>
    )
}