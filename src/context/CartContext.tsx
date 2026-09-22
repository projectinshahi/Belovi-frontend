"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  size?: string;
  /**
   * The chosen variant's colour, carried for display. The bag still keys a line
   * on id + size — colour is descriptive here, not part of the identity — so two
   * colours of one size would merge rather than sit as separate lines.
   */
  color?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  /**
   * Resolves once the line is in local state AND, for a signed-in shopper, once
   * the server cart has accepted it. Was typed `void` even though the
   * implementation is async, so callers could not await the write — "Buy Now"
   * compensated with a 500ms guess before navigating.
   */
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string, qty: number, size?: string) => void;
  removeItem: (id: string, size?: string) => void;
  clearCart: () => void;
  clearLocalCart: () => void;
  refreshCart: () => Promise<void>;
  syncCartAfterLogin: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ── Module-level helpers (no component state, safe to hoist) ──
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000";
  return `${baseUrl}/api/v1`;
};

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("belovi_user");
    if (userStr) {
      try {
        return JSON.parse(userStr).token ?? null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

const readLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("belovi_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Map a populated backend cart (items.product) into frontend CartItem shape.
const mapBackendItems = (items: any[]): CartItem[] =>
  items
    .filter((item) => item?.product) // drop lines whose product was deleted
    .map((item) => {
      const variant =
        item.product.variants?.find((v: any) => v.volume === item.size) ||
        item.product.variants?.[0];

      // Prefer a product-level image, then the chosen variant's image, then any
      // variant image — so products photographed only per-variant still show a
      // cart/checkout thumbnail.
      const image =
        item.product.images?.[0] ||
        variant?.images?.[0] ||
        item.product.variants?.map((v: any) => v.images?.[0]).find(Boolean) ||
        "";

      return {
        id: item.product._id,
        name: item.product.name,
        image,
        price: variant?.price || 0,
        currency: "₹",
        size: variant?.volume || item.size,
        quantity: item.quantity,
      };
    });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [, setIsLoaded] = useState(false);

  // Fetch the authenticated user's cart from the backend and adopt it as source of truth.
  const refreshCart = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(`${getApiUrl()}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.data?.items) {
        const items = mapBackendItems(res.data.data.items);
        setCartItems(items);
        localStorage.setItem("belovi_cart", JSON.stringify(items));
      }
    } catch (err) {
      console.error("Failed to refresh cart from backend", err);
    }
  }, []);

  // Called right after login: merge any guest cart into the DB cart, then adopt the result.
  const syncCartAfterLogin = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const guestItems = readLocalCart();

    try {
      if (guestItems.length > 0) {
        const res = await axios.post(
          `${getApiUrl()}/cart/merge`,
          {
            items: guestItems.map((i) => ({
              productId: i.id,
              quantity: i.quantity,
              size: i.size,
            })),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success && res.data.data?.items) {
          const items = mapBackendItems(res.data.data.items);
          setCartItems(items);
          localStorage.setItem("belovi_cart", JSON.stringify(items));
          return;
        }
      }
      // No guest items (or merge returned nothing) — just pull the saved cart.
      await refreshCart();
    } catch (err) {
      console.error("Failed to sync cart after login", err);
      await refreshCart();
    }
  }, [refreshCart]);

  // On first mount / browser refresh: restore from backend if logged in, else from localStorage.
  useEffect(() => {
    const initCart = async () => {
      const token = getToken();
      if (token) {
        await refreshCart();
      } else {
        setCartItems(readLocalCart());
      }
      setIsLoaded(true);
    };
    initCart();
  }, [refreshCart]);

  const addToCart = async (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size);
      let newCart;
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        newCart = prev.map((i) =>
          i.id === item.id && i.size === item.size ? { ...i, quantity: newQty } : i
        );
      } else {
        newCart = [...prev, item];
      }
      localStorage.setItem("belovi_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      try {
        await axios.post(
          `${getApiUrl()}/cart`,
          { productId: item.id, quantity: item.quantity, size: item.size },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to add to backend cart", err);
      }
    }
  };

  const updateQuantity = async (id: string, qty: number, size?: string) => {
    if (qty < 1) return;
    setCartItems((prev) => {
      const newCart = prev.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity: qty } : i
      );
      localStorage.setItem("belovi_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      try {
        await axios.put(
          `${getApiUrl()}/cart/item`,
          { productId: id, quantity: qty, size },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to update backend cart", err);
      }
    }
  };

  const removeItem = async (id: string, size?: string) => {
    setCartItems((prev) => {
      /* Match on id AND size — the same identity key `addToCart` and
         `updateQuantity` use. Filtering on id alone removed every colourway and
         size of a piece when the shopper deleted one line, and the backend
         DELETE below already scopes by size, so local and server then
         disagreed until the next refresh put the other lines back. */
      const newCart = prev.filter((i) => !(i.id === id && i.size === size));
      localStorage.setItem("belovi_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      try {
        await axios.delete(`${getApiUrl()}/cart/item`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId: id, size },
        });
      } catch (err) {
        console.error("Failed to remove from backend cart", err);
      }
    }
  };

  // Clears everywhere — local + backend. Use after a successful order.
  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("belovi_cart");

    const token = getToken();
    if (token) {
      try {
        await axios.delete(`${getApiUrl()}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to clear backend cart", err);
      }
    }
  };

  // Clears local state only, leaving the DB cart intact. Use on logout.
  const clearLocalCart = () => {
    setCartItems([]);
    localStorage.removeItem("belovi_cart");
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        clearLocalCart,
        refreshCart,
        syncCartAfterLogin,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
