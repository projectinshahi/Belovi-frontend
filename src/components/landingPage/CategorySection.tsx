"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";

const DEFAULT_CATEGORIES = [
  {
    id: 'skin-care',
    label: 'Skin Care',
    image: '/images/skin-care.jpg',
    alt: 'Skin Care category featuring moisturizing brightening sunscreen',
    count: 24,
  },
  {
    id: 'lip-care',
    label: 'Lip Care',
    image: '/images/lip-care.jpg',
    alt: 'Lip Care category featuring nourished glossy lips',
    count: 18,
  },
  {
    id: 'body-care',
    label: 'Body Care',
    image: '/images/body-care.jpg',
    alt: 'Body Care category featuring luxurious body cream application',
    count: 32,
  },
];

export default function CategorySection() {
  const [categories, setCategories] = useState<typeof DEFAULT_CATEGORIES>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
          : 'http://localhost:5000';
        // Fetch categories and products together so we can count products per category
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${baseUrl}/api/v1/categories`),
          axios.get(`${baseUrl}/api/v1/products`),
        ]);

        const products: { category?: string }[] = prodRes.data?.data || [];
        const countForCategory = (name: string) =>
          products.filter(
            (p) => (p.category || '').trim().toLowerCase() === name.trim().toLowerCase()
          ).length;

        if (catRes.data.success && catRes.data.data) {
          const activeCats = catRes.data.data.filter((c: any) => c.status === 'ACTIVE').slice(0, 6);

          if (activeCats.length > 0) {
            const formatted = activeCats.map((c: any, index: number) => ({
              id: c.name.toLowerCase().replace(/\s+/g, '-'),
              label: c.name,
              image: c.image || DEFAULT_CATEGORIES[index % 3].image,
              alt: `${c.name} category`,
              count: countForCategory(c.name),
            }));
            setCategories(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

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
    <section ref={sectionRef} className="bg-[#0a0a0a] py-12 md:py-20 lg:py-24 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header row */}
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-12">
          <div
            className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <h2 className="font-sans font-black text-2xl md:text-3xl lg:text-4xl text-white tracking-tight">
              Shop by Category
            </h2>
            <p className="font-sans font-normal text-base md:text-lg text-slate-400 mt-2">
              Browse our diverse collection
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center gap-2 font-sans font-bold text-sm md:text-base text-white hover:text-[#593dab] transition-colors duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#593dab] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] rounded-md px-1"
          >
            View All
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              aria-label={`Browse ${category.label}`}
              className={`group rounded-2xl overflow-hidden bg-[#121212] border border-white/5 hover:border-[#593dab]/60 hover:-translate-y-1 transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-[#593dab] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  priority={index < 3}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="font-sans font-bold text-base text-white leading-tight mb-1 truncate">
                  {category.label}
                </h3>
                <p className="font-sans font-normal text-sm text-[#a78bda]">
                  {category.count} items
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
