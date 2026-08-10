"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import Logo from "../ui/Logo";
import { SHOP_CATEGORY_LINKS } from "../../lib/categories";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "about", label: "About" },
];

// Built from the fixed category list so the menu cannot drift from what a piece
// can be filed under. Independent of the studio's editorial categories on the
// homepage. No extra "All Products" row is appended — it is one of the five, and
// the "Shop" item itself already links to the unfiltered `/products`.
const SHOP_SUBPAGES = SHOP_CATEGORY_LINKS.map((c) => ({
  href: `/products?category=${c.id}`,
  label: c.name,
}));

function Wordmark() {
  return (
    <Link
      href="/"
      aria-label="BELOVI — home"
      className="group relative block text-black hover:opacity-60 transition-opacity duration-300"
    >
      {/* `ink` tone: the brand PNG is white-on-black and would render as a plate
          on the ivory bar. Same box height either way, so nothing shifts. */}
      <Logo priority tone="ink" className="h-[36px] sm:h-[42px] lg:h-[48px]" />
    </Link>
  );
}

const Ic = {
  search: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  user: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  bag: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  menu: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  close: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);

  const { cartCount, clearLocalCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  // One class string for the three desktop links, so they cannot drift apart in
  // size, weight or hover behaviour.
  const navLinkClass =
    "relative text-black text-[14px] font-medium tracking-wide hover:opacity-60 transition-opacity flex items-center gap-1.5";
  /** Hairline rule under the section you are in — the bar had no active state. */
  const activeClass =
    "after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-px after:bg-black";

  const isActive = (id: string) => {
    if (id === "home") return pathname === "/";
    if (id === "shop") return pathname.startsWith("/products");
    if (id === "about") return pathname.startsWith("/about");
    return false;
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("belovi_user"));
    setMobileOpen(false);
    if (pathname !== "/products") setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("belovi_user");
    setIsLoggedIn(false);
    clearLocalCart();
    setMobileOpen(false);
    router.push("/sign-in");
  };

  const runSearch = (value: string) => {
    setQuery(value);
    const q = value.trim();
    const url = q ? `/products?search=${encodeURIComponent(q)}` : "/products";
    if (pathname === "/products") window.history.replaceState(null, "", url);
    else router.push(url);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const sectionHref = (id: string) => {
    if (id === "about") return "/about";
    if (id === "contact") return "/contact";
    if (id === "shop") return "/products";
    return `/#${id}`;
  };

  const goToSection = (e: React.MouseEvent, id: string) => {
    setMobileOpen(false);
    if (id === "about" || id === "contact") return;
    if (pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", `/#${id}`);
      }
    }
  };

  const goToHome = (e: React.MouseEvent) => {
    setMobileOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", "/");
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        // Ivory pill. The shadow does the lifting off the page that the border
        // used to do on black — a hairline dark rule at this radius reads as a
        // drawn outline rather than a floating bar, so it stays near-invisible.
        className="fixed top-4 left-4 right-4 lg:top-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[calc(100%-3rem)] max-w-[1200px] z-50 rounded-full bg-ivory shadow-[0_6px_28px_rgba(0,0,0,0.10)] border border-black/[0.06]"
      >
        <div className="h-[72px] lg:h-[84px] w-full px-6 lg:px-8 flex items-center justify-between">

          {/* LEFT — Mobile Menu & Desktop Logo */}
          <div className="flex items-center gap-4 flex-1 lg:flex-none lg:w-[200px]">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-1 -ml-1 text-black hover:opacity-60 transition-opacity"
              aria-label="Open menu"
            >
              <Ic.menu width={22} height={22} />
            </button>
            <div className="hidden lg:block">
              <Wordmark />
            </div>
          </div>

          {/* CENTER — Mobile Logo & Navigation Links */}
          <div className="flex justify-center items-center lg:flex-1">
            <div className="lg:hidden">
              <Wordmark />
            </div>
            <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-10">
            {SECTIONS.map((item) =>
              item.id === "shop" ? (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <Link
                    href={sectionHref(item.id)}
                    onClick={(e) => goToSection(e, item.id)}
                    className={`${navLinkClass} ${isActive(item.id) ? activeClass : ""}`}
                    aria-haspopup="true"
                    aria-expanded={shopOpen}
                    aria-current={isActive(item.id) ? "page" : undefined}
                  >
                    {item.label}
                    <span className={`text-[10px] transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}>▾</span>
                  </Link>
                  <AnimatePresence>
                    {shopOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-6"
                      >
                        <div className="min-w-[220px] bg-ivory rounded-2xl border border-black/[0.06] shadow-[0_10px_36px_rgba(0,0,0,0.12)] py-3 px-2 flex flex-col gap-1">
                          {SHOP_SUBPAGES.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setShopOpen(false)}
                              className="block px-4 py-2.5 text-[13px] font-medium text-black hover:bg-black/[0.06] rounded-lg transition-colors whitespace-nowrap"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={sectionHref(item.id)}
                  onClick={item.id === "home" ? goToHome : (e) => goToSection(e, item.id)}
                  className={`${navLinkClass} ${isActive(item.id) ? activeClass : ""}`}
                  aria-current={isActive(item.id) ? "page" : undefined}
                >
                  {item.label}
                  {/* Keep invisible chevron for balance with shop */}
                  <span className="text-[10px] opacity-0">▾</span>
                </Link>
              )
            )}
            </nav>
          </div>

          {/* RIGHT — Icons */}
          {/* Search · Account · Bag. Tighter gap on the narrowest phones so the
              three still sit clear of the centred wordmark. */}
          <div className="flex items-center justify-end gap-4 sm:gap-5 lg:gap-6 flex-1 lg:flex-none lg:w-[200px] text-black">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="hover:opacity-60 transition-opacity"
            >
              <Ic.search width={20} height={20} />
            </button>

            <Link
              href={isLoggedIn ? "/profile" : "/sign-in"}
              aria-label="Account"
              className="hover:opacity-60 transition-opacity"
            >
              <Ic.user width={20} height={20} />
            </Link>

            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Bag, ${cartCount} items` : "Bag"}
              className="relative hover:opacity-60 transition-opacity flex items-center justify-center"
            >
              <Ic.bag width={20} height={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-sans font-bold flex items-center justify-center bg-black text-ivory">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 top-[110%] overflow-hidden bg-ivory rounded-3xl shadow-[0_10px_36px_rgba(0,0,0,0.12)] border border-black/[0.06]"
            >
              <form onSubmit={submitSearch} role="search" className="px-6 py-6">
                <div className="flex items-center gap-4 border-b border-black/10 pb-3">
                  <Ic.search width={20} height={20} className="text-black/40 shrink-0" />
                  <input
                    autoFocus
                    type="search"
                    value={query}
                    onChange={(e) => runSearch(e.target.value)}
                    placeholder="Search products, collections…"
                    aria-label="Search"
                    /* min-w-0 so a long value can never push the row wider than
                       the pill on a narrow phone. */
                    className="w-full min-w-0 bg-transparent font-sans text-xl text-black placeholder:text-black/30 focus:outline-none"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-black/40 hover:text-black transition-colors shrink-0">
                    <Ic.close width={22} height={22} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[82%] max-w-[360px] bg-ivory flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between h-[72px] px-6 border-b border-black/10">
                <div className="text-black">
                  <Logo tone="ink" className="h-[36px]" />
                </div>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-black hover:opacity-60 transition-opacity">
                  <Ic.close width={22} height={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-6 text-black">
                {SECTIONS.map((item) =>
                  item.id === "shop" ? (
                    <div key={item.id} className="border-b border-black/10">
                      <button
                        onClick={() => setMobileShopOpen((v) => !v)}
                        className="w-full flex items-center justify-between py-5 font-sans text-xl font-medium tracking-wide"
                        aria-expanded={mobileShopOpen}
                      >
                        {item.label}
                        <span className={`text-sm transition-transform ${mobileShopOpen ? "rotate-180" : ""}`}>▾</span>
                      </button>
                      <AnimatePresence>
                        {mobileShopOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-5 pl-4 flex flex-col gap-3">
                              {SHOP_SUBPAGES.map((sub) => (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="text-[15px] text-black/60 hover:text-black font-medium transition-colors"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={item.id}
                      href={sectionHref(item.id)}
                      onClick={item.id === "home" ? goToHome : (e) => goToSection(e, item.id)}
                      className="block py-5 font-sans text-xl font-medium tracking-wide border-b border-black/10"
                    >
                      {item.label}
                    </Link>
                  )
                )}

                <div className="mt-8 space-y-5">
                  <Link href={isLoggedIn ? "/profile" : "/sign-in"} onClick={() => setMobileOpen(false)}
                    className="block font-sans text-[15px] font-medium text-black/60 hover:text-black transition-colors">
                    Account
                  </Link>
                  {isLoggedIn && (
                    <button onClick={handleLogout} className="block font-sans text-[15px] font-medium text-black/60 hover:text-black transition-colors">
                      Sign Out
                    </button>
                  )}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
