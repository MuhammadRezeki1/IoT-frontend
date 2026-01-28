"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Page() {
  const welcomeRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const container = document.getElementById("particle-container");
    if (container && container.childElementCount === 0) {
      for (let i = 0; i < 50; i++) {
        const dot = document.createElement("div");
        dot.className = "particle";
        dot.style.top = `${Math.random() * 100}%`;
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.animationDuration = `${Math.random() * 6 + 4}s`;
        container.appendChild(dot);
      }
    }

    const auroras = document.querySelectorAll<HTMLElement>(
      ".aurora-left, .aurora-right"
    );

    const handleMouseMove = (e: MouseEvent) => {
      auroras.forEach((aurora) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        aurora.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseEnter = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.classList.add("hovered");
  };

  const handleMouseLeave = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.classList.remove("hovered");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">

      <div id="particle-container" className="absolute inset-0 z-0" />
      <div className="aurora-left z-0" />
      <div className="aurora-right z-0" />

      {/* ===== WELCOME ===== */}
      <div
        ref={welcomeRef}
        onMouseEnter={() => handleMouseEnter(welcomeRef)}
        onMouseLeave={() => handleMouseLeave(welcomeRef)}
        className="
          relative z-10
          inline-flex items-center justify-center
          px-[5.6rem] py-[2.2rem]
          rounded-[3.2rem]                /* RADIUS BESAR DEFAULT */
          bg-white/5
          backdrop-blur-md
          overflow-hidden
          transition-all duration-500 ease-out
          hover:scale-105
          hover:bg-white/10
          hover:rounded-[1.8rem]          /* RADIUS MENGECIL SAAT HOVER */
          animate-fade-in
        "
      >
        <h1
          className="
            font-(--font-playfair)
            text-[4rem]
            lg:text-[8.2rem]
            font-black
            tracking-tight
            leading-none
            whitespace-nowrap
            text-white
            drop-shadow-[0_0_22px_rgba(255,255,255,0.18)]
          "
        >
          WELCOME
        </h1>
      </div>

      {/* ===== DESKRIPSI ===== */}
      <div
        ref={descRef}
        onMouseEnter={() => handleMouseEnter(descRef)}
        onMouseLeave={() => handleMouseLeave(descRef)}
        className="
          relative z-10
          mt-16 lg:mt-24
          inline-flex items-center justify-center
          px-[3.6rem] py-[1.8rem]
          rounded-[2.4rem]
          bg-white/5
          backdrop-blur-md
          overflow-hidden
          transition-all duration-500 ease-out
          hover:scale-[1.03]
          hover:bg-white/10
          animate-fade-in
        "
      >
        <p
          className="
            font-(--font-inter)
            text-lg
            lg:text-xl
            text-gray-300
            text-center
            leading-[1.7]
            max-w-2xl
          "
        >
          Sistem monitoring konsumsi energi listrik berbasis IoT,
          <br />
          dilengkapi analisis rule-based dan visualisasi real-time
        </p>
      </div>

      {/* ===== BUTTON ===== */}
      <Link
        ref={buttonRef}
        href="/dashboard"
        onMouseEnter={() => handleMouseEnter(buttonRef)}
        onMouseLeave={() => handleMouseLeave(buttonRef)}
        className="
          mt-24 lg:mt-36
          button
          transition-all duration-500 ease-out
          hover:scale-110
          animate-fade-in
        "
      >
        MASUK DASHBOARD
      </Link>
    </main>
  );
}
