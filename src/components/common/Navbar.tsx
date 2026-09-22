"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import Logo from "../ui/Logo";
import { useCategories } from "../../lib/categories";

/**
 * The Figma header: a solid black bar (not the old floating ivory pill), the
 * wordmark at the left, the nav set inside a translucent white pill at the
 * centre, and search / bag / account at the right.
 *
 * All of the previous bar's behaviour is kept — the search drawer, the live cart
 * count, the auth-aware account link, the Collections dropdown, the mobile
 * drawer with its scroll lock and Escape handling. Only the surface changed.
 */

const NAV = [
  { id: "home", label: "Home", href: "/" },
  { id: "collections", label: "Collections", href: "/products" },
  { id: "about", label: "About Us", href: "/about" },
];

// The Collections dropdown is built inside the component now — it reads the
// live category list, so a category the studio adds appears here without a
// deploy, and the menu still cannot drift from what a piece can be filed under.

const Ic = {
  search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  user: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" />
      <path d="M6.2 18.4a6.5 6.5 0 0 1 11.6 0" />
    </svg>
  ),
  bag: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h2.6l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L21 7H5.2" />
    </svg>
  ),
  menu: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  close: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}>
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
  /** Solid plate once scrolled, so the bar stays legible over light sections. */
  const [scrolled, setScrolled] = useState(false);

  const { cartCount, clearLocalCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  /* "All Products" leads, then the studio's categories.
   *
   * The menu listed only categories, so once the hardcoded "All Products"
   * category was removed there was no route from here to the unfiltered
   * catalogue — every entry narrowed the listing and none opened it whole.
   * `/products` with no query is that page.
   *
   * One array feeds both the desktop dropdown and the mobile drawer, so this
   * appears in every view at once and cannot drift between them. */
  const shopSubpages = [
    { href: "/products", label: "All Products" },
    ...(useCategories() ?? []).map((c) => ({
      href: `/products?category=${c.id}`,
      label: c.name,
    })),
  ];
  const hasSubpages = shopSubpages.length > 0;

  const isActive = (id: string) => {
    if (id === "home") return pathname === "/";
    if (id === "collections") return pathname.startsWith("/products");
    if (id === "about") return pathname.startsWith("/about");
    return false;
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("belovi_user"));
    setMobileOpen(false);
    if (pathname !== "/products") setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  /**
   * Search routing, debounced.
   *
   * This used to call `window.history.replaceState` while already on
   * /products. That rewrote the address bar but did NOT update
   * `useSearchParams()` — only a router navigation does — and ProductBrowser
   * syncs its `searchTerm` from exactly that. The result: the first keystroke
   * navigated and filtered, and every character after it moved the URL while
   * the grid stayed frozen on the one-letter query.
   *
   * `router.replace` updates the params for real. `scroll: false` keeps the
   * grid still while typing, and replace (not push) means a five-letter word
   * leaves one history entry rather than five.
   */
  const commitSearch = useCallback(
    (value: string) => {
      const q = value.trim();
      const url = q ? `/products?search=${encodeURIComponent(q)}` : "/products";
      if (pathname === "/products") router.replace(url, { scroll: false });
      else router.push(url);
    },
    [pathname, router]
  );

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clear the pending route change; returns nothing, safe to call twice. */
  const cancelPendingSearch = () => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
  };

  /* The field updates on every keystroke; the route follows once typing pauses.
     Routing per character would yank the reader to /products on the first
     letter, mid-word, and re-run the filter five times for one search. */
  const runSearch = (value: string) => {
    setQuery(value);
    cancelPendingSearch();
    searchTimer.current = setTimeout(() => commitSearch(value), 250);
  };

  /** Enter should not wait out the debounce. */
  const submitSearch = () => {
    cancelPendingSearch();
    commitSearch(query);
    setSearchOpen(false);
  };

  // A pending timer firing after unmount would route from a dead component.
  useEffect(() => cancelPendingSearch, []);

  /**
   * Opening the drawer seeds the field from the URL it is about to edit.
   *
   * Without this the box opens empty on /products?search=sofa — showing nothing
   * while the grid below is filtered — and pressing Enter would then commit that
   * empty value and silently wipe the search the reader was looking at. Read off
   * `location` rather than `useSearchParams`, which would force a Suspense
   * boundary around the whole header.
   */
  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (!open) {
        setQuery(new URLSearchParams(window.location.search).get("search") ?? "");
      } else {
        cancelPendingSearch();
      }
      return !open;
    });
  };

  const goHome = (e: React.MouseEvent) => {
    setMobileOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", "/");
    }
  };

  /**
   * A red dot marks the current section and rises into place on hover, while the
   * label lifts 2px. Drawn with ::after so it costs no extra element per link.
   */
  const linkClass = (id: string) =>
    `relative font-sans text-[15px] transition-[color,transform] duration-300
     ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 xl:text-[17px]
     after:absolute after:-bottom-2 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2
     after:rounded-full after:bg-brand after:transition-transform after:duration-300
     after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-100 ${
       isActive(id) ? "text-brand after:scale-100" : "text-white hover:text-brand after:scale-0"
     }`;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`surface-dark fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? "bg-onyx/95 backdrop-blur-md" : "bg-onyx"
        }`}
      >
        <div className="section-x flex h-[76px] items-center justify-between gap-6 lg:h-[106px]">
          {/* LEFT — menu (mobile) + wordmark
              `flex-1` at every width, right column to match: the two flank the
              pill with equal shares of the free space, which is what actually
              centres it on the bar. Sizing them to their content instead left
              the pill sitting right of centre, because the wordmark is wider
              than the three icons opposite it and `justify-between` only centres
              a middle item when its neighbours are the same width. */}
          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="-ml-1 p-1 text-white transition-opacity hover:opacity-60 lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Ic.menu width={24} height={24} />
            </button>
            <Link href="/" onClick={goHome} aria-label="BELOVI — home" className="block">
              {/* Desktop steps down from 34px; the phone and tablet sizes below
                  it are deliberately untouched. */}
              <Logo priority className="h-[26px] w-auto sm:h-[30px] lg:h-[30px]" />
            </Link>
          </div>

          {/* CENTRE — the glass pill */}
          <nav className="hidden items-center gap-8 rounded-full bg-white/10 px-8 py-4 backdrop-blur-sm lg:flex xl:gap-12">
            {NAV.map((item) =>
              /* Only a dropdown when there is something in it — otherwise
                 Collections falls through to the plain-link branch below and
                 goes straight to the shop, with no chevron promising a menu
                 that would open empty. */
              item.id === "collections" && hasSubpages ? (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <Link
                    href={item.href}
                    className={`${linkClass(item.id)} flex items-center gap-1.5`}
                    aria-haspopup="true"
                    aria-expanded={shopOpen}
                    aria-current={isActive(item.id) ? "page" : undefined}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`text-[10px] transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </Link>
                  <AnimatePresence>
                    {shopOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-1/2 top-full -translate-x-1/2 pt-7"
                      >
                        <div className="flex min-w-[230px] flex-col gap-1 rounded-[24px] border border-white/10 bg-onyx-soft p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                          {shopSubpages.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setShopOpen(false)}
                              className="whitespace-nowrap rounded-full px-4 py-2.5 font-sans text-[15px] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
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
                  href={item.href}
                  onClick={item.id === "home" ? goHome : undefined}
                  className={linkClass(item.id)}
                  aria-current={isActive(item.id) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* RIGHT — search · bag · account */}
          <div className="flex flex-1 items-center justify-end gap-5 text-white sm:gap-6">
            <button
              onClick={toggleSearch}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="transition-colors duration-300 hover:text-brand"
            >
              <Ic.search width={22} height={22} />
            </button>

            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Bag, ${cartCount} items` : "Bag"}
              /* The product page's add-to-cart flies a dot to this element, so
                 it needs a stable handle. An attribute rather than an id: the
                 nav renders twice (desktop bar and mobile drawer) and duplicate
                 ids would be invalid — the flight picks the visible one. */
              data-cart-target
              className="relative flex items-center justify-center transition-colors duration-300 hover:text-brand"
            >
              <Ic.bag width={22} height={22} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-brand px-1 font-sans text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href={isLoggedIn ? "/profile" : "/sign-in"}
              aria-label="Account"
              className="transition-colors duration-300 hover:text-brand"
            >
              <Ic.user width={22} height={22} />
            </Link>
          </div>
        </div>

        {/* Search drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/10 bg-onyx"
            >
              <form
                onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
                role="search"
                className="section-x py-6"
              >
                <div className="section-inner flex items-center gap-4 border-b border-white/20 pb-3">
                  <Ic.search width={20} height={20} className="shrink-0 text-white/40" />
                  <input
                    autoFocus
                    type="search"
                    value={query}
                    onChange={(e) => runSearch(e.target.value)}
                    placeholder="Search pieces, collections…"
                    aria-label="Search"
                    className="w-full min-w-0 bg-transparent font-sans text-lg text-white placeholder:text-white/30 focus:outline-none sm:text-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                    className="shrink-0 text-white/50 transition-colors hover:text-white"
                  >
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
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="surface-dark fixed bottom-0 left-0 top-0 z-[70] flex w-[85%] max-w-[380px] flex-col bg-onyx lg:hidden"
            >
              <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
                <Logo className="h-[26px] w-auto" />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-white transition-opacity hover:opacity-60"
                >
                  <Ic.close width={22} height={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-6">
                {NAV.map((item) =>
                  // Same rule as the bar: no categories, no accordion.
                  item.id === "collections" && hasSubpages ? (
                    <div key={item.id} className="border-b border-white/10">
                      <button
                        onClick={() => setMobileShopOpen((v) => !v)}
                        className="flex w-full items-center justify-between py-5 font-sans text-lg text-white"
                        aria-expanded={mobileShopOpen}
                      >
                        {item.label}
                        <span aria-hidden className={`text-sm transition-transform duration-300 ${mobileShopOpen ? "rotate-180" : ""}`}>▾</span>
                      </button>
                      <AnimatePresence>
                        {mobileShopOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-3 pb-5 pl-4">
                              {shopSubpages.map((sub) => (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="font-sans text-[15px] text-white/60 transition-colors hover:text-white"
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
                      href={item.href}
                      onClick={item.id === "home" ? goHome : () => setMobileOpen(false)}
                      className={`block border-b border-white/10 py-5 font-sans text-lg ${
                        isActive(item.id) ? "text-brand" : "text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}

                <div className="mt-8 space-y-5">
                  <Link
                    href={isLoggedIn ? "/profile" : "/sign-in"}
                    onClick={() => setMobileOpen(false)}
                    className="block font-sans text-[15px] text-white/60 transition-colors hover:text-white"
                  >
                    Account
                  </Link>
                  {isLoggedIn && (
                    <button
                      onClick={handleLogout}
                      className="block font-sans text-[15px] text-white/60 transition-colors hover:text-white"
                    >
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
