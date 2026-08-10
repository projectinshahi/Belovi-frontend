"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ValueSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] w-full py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">

          {/* Image Panel */}
          <div
            className={`relative rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl shadow-black/20 aspect-[4/5] lg:aspect-square w-full transition-all duration-700 ease-out group motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
              }`}
          >
            <Image
              src="/images/value-image.png"
              alt="Curology moisturizer product on geometric platform"
              fill
              priority
              className=" object-fill transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none"
              sizes="(max-width: 1024px) 80vw, 50vw"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/30 to-transparent pointer-events-none" />
          </div>

          {/* Content Panel */}
          <div className="flex flex-col justify-center">

            <p
              className={`font-sans font-semibold text-xs md:text-sm tracking-[0.25em] uppercase text-blue-300 mb-4 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
              style={{ transitionDelay: "300ms" }}
            >
              MORE THAN A PRODUCT
            </p>

            <h2 
              className={`font-serif font-normal text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              It&apos;s<br />
              Confidence<br />
              <span className="italic">You Can Feel</span>
            </h2>

            <p
              className={`font-sans font-normal text-base md:text-lg text-slate-400 leading-relaxed max-w-lg mb-12 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
              style={{ transitionDelay: "500ms" }}
            >
              At NEOKART, we don&apos;t just create products. We create experiences that elevate your everyday lifestyle.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">

              {/* Feature 1 */}
              <div
                className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                  }`}
                style={{ transitionDelay: "600ms" }}
              >
                <h3 className="font-sans font-bold text-sm md:text-base tracking-[0.15em] uppercase text-white mb-3">
                  PREMIUM QUALITY
                </h3>
                <p className="font-sans font-normal text-xs md:text-sm tracking-wide uppercase text-slate-500 leading-relaxed">
                  CAREFULLY SELECTED INGREDIENTS WITH STRICT QUALITY STANDARDS FOR TOP-TIER PERFORMANCE.
                </p>
              </div>

              {/* Feature 2 */}
              <div
                className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                  }`}
                style={{ transitionDelay: "700ms" }}
              >
                <h3 className="font-sans font-bold text-sm md:text-base tracking-[0.15em] uppercase text-white mb-3">
                  SKIN-FRIENDLY FORMULA
                </h3>
                <p className="font-sans font-normal text-xs md:text-sm tracking-wide uppercase text-slate-500 leading-relaxed">
                  GENTLE, EFFECTIVE, AND SUITED FOR DAILY USE — ESPECIALLY FOR INDIAN CONDITIONS.
                </p>
              </div>

              {/* Feature 3 */}
              <div 
                className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ transitionDelay: "800ms" }}
              >
                <h3 className="font-sans font-bold text-sm md:text-base tracking-[0.15em] uppercase text-white mb-3">
                  REAL RESULTS
                </h3>
                <p className="font-sans font-normal text-xs md:text-sm tracking-wide uppercase text-slate-500 leading-relaxed">
                  VISIBLE AND CONSISTENT OUTCOMES — NO EMPTY PROMISES, JUST WHAT YOU SEE.
                </p>
              </div>

              {/* Feature 4 */}
              <div 
                className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ transitionDelay: "900ms" }}
              >
                <h3 className="font-sans font-bold text-sm md:text-base tracking-[0.15em] uppercase text-white mb-3">
                  BUILT FOR INDIA
                </h3>
                <p className="font-sans font-normal text-xs md:text-sm tracking-wide uppercase text-slate-500 leading-relaxed">
                  GLOBAL QUALITY, ACCESSIBLE AND RELATABLE — A BRAND WITH PURPOSE AND VISION.
                </p>
              </div>

            </div>

            {/* CTA Button */}
            <Link
              href="/process"
              aria-label="Discover our scientific process and product development"
              className={`mt-10 self-center md:self-start bg-black text-[#0a0a0a] px-8 md:px-10 py-4 md:py-5 rounded-full font-sans font-bold text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-slate-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] motion-reduce:transition-none motion-reduce:transform-none ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "1000ms" }}
            >
              DISCOVER OUR PROCESS
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
