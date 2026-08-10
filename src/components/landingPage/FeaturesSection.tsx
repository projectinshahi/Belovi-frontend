"use client";

import { useEffect, useRef, useState } from "react";

interface Feature {
  id: string;
  step: string;
  category: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: "micro-zinc-shield",
    step: "01",
    category: "TECHNOLOGY",
    title: "Micro-Zinc Shield",
    description: "Ultra-fine mineral protection that forms a lightweight barrier against harmful UV rays without clogging pores or leaving a white cast."
  },
  {
    id: "hydration-lock",
    step: "02",
    category: "HYDRATION",
    title: "Hydration Lock System",
    description: "Infused with Hyaluronic Acid and Ceramides to deeply hydrate and strengthen your skin barrier, keeping moisture locked in all day."
  },
  {
    id: "photo-stable",
    step: "03",
    category: "EFFICACY",
    title: "Photo-Stable Formula",
    description: "Engineered to remain stable under sunlight, ensuring long-lasting protection and consistent performance without breaking down."
  },
  {
    id: "clean-conscious",
    step: "04",
    category: "ETHICS",
    title: "Clean & Conscious",
    description: "Made with skin-safe, cruelty-free, and environmentally responsible ingredients that care for you and the planet."
  }
];

export default function FeaturesSection() {
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
    <section ref={sectionRef} className="bg-black w-full pt-16 md:pt-24 lg:pt-32 pb-8 md:pb-12 lg:pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 md:mb-20">
          <div className="lg:max-w-2xl">
            <p 
              className={`font-sans font-bold text-xs tracking-[0.15em] uppercase text-blue-800 mb-3 transition-opacity duration-400 ease-out motion-reduce:transition-none ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              SUPERIOR STANDARDS
            </p>
            <h2 
              className={`font-serif font-normal text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-tight transition-all duration-600 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Advanced Skin Defence
            </h2>
          </div>
          
          <div 
            className={`lg:max-w-sm lg:text-right transition-all duration-600 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <p className="font-sans font-normal text-base md:text-lg text-slate-400 leading-relaxed">
              Every drop of NEOKART is crafted with powerful actives to protect, nourish, and elevate your skin in modern environments.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            return (
              <article
                key={feature.id}
                className={`group relative p-6 md:p-8 rounded-2xl cursor-default transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } border border-transparent bg-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                {/* Step Number */}
                <div 
                  className="font-serif font-normal text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 select-none transition-colors duration-300 text-slate-200 group-hover:text-blue-100/60"
                  aria-hidden="true"
                >
                  {feature.step}
                </div>

                {/* Category Tag */}
                <div className="mb-4">
                  <span 
                    className="inline-block px-3 py-1.5 rounded-full font-sans font-semibold text-[10px] md:text-xs tracking-[0.15em] uppercase transition-colors duration-200 bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800"
                    aria-label={`Feature category: ${feature.category}`}
                  >
                    {feature.category}
                  </span>
                </div>

                {/* Feature Title */}
                <h3 className="font-serif font-normal text-xl md:text-2xl text-slate-900 mb-3">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="font-sans font-normal text-sm md:text-base text-slate-500 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Bottom Accent */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-blue-500 rounded-t-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
