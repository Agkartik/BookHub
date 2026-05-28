import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GlassPage({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll(".glass-animate"),
      { opacity: 0, y: 15, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", clearProps: "transform" }
    );
  }, []);

  return (
    <div ref={ref} className="glass-page-root relative transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="glass-page-bg absolute inset-0" />
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.06),transparent)]" />
      </div>
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
