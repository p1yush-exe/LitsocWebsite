"use client"

import {useRef, ReactNode, MouseEvent} from "react";
import {motion, useMotionValue, animate} from "framer-motion";

interface magnetWrapProps
{
    children: ReactNode;
    className?: string;
    strength?: number;
    radius?: number;
    returnSpeed?: number;
}

export default function MagnetWrap({
    children,    className,    strength=0.1,
    radius=30,
    returnSpeed=0.4
} : magnetWrapProps)
{
    const ref= useRef<HTMLDivElement | null>(null);

    const x= useMotionValue(0);
    const y= useMotionValue(0);

    const resetPosition=()=>{
        animate(x,0,{duration:returnSpeed});
        animate(y,0,{duration:returnSpeed});
    }

    const handleMouseMove=(e:MouseEvent<HTMLDivElement>)=>{
        if(window.innerWidth <= 768) return;
        const el= ref.current;
        if(!el) return;

        const rect= el.getBoundingClientRect();
        const centerX= rect.left+rect.width /2;
        const centerY= rect.top+rect.height /2;

        const distX= e.clientX - centerX;
        const distY= e.clientY-centerY;
        const distance = Math.sqrt(distX**2+distY**2);

        if(distance<radius){
            x.set(distX * strength);
            y.set(distY * strength);
        }
        else{
            resetPosition();
        }
    }

    return(
        <motion.div
        ref={ref}
        className={className}
        style={{display:"inline-block",x,y}}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetPosition}>
            {children}
        </motion.div>
    )
}