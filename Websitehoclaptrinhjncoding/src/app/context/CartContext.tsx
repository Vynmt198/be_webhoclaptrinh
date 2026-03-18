import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  instructor?: string;
  duration?: string | number;
  lessons?: number;
  level?: string;
  originalPrice?: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (course: CartItem) => void;
  removeFromCart: (id: string) => void;
  removeManyFromCart: (ids: string[]) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const storageKey = "cart_items";

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  // Persist cart across full-page redirects (VNPay) and refreshes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore storage errors (quota/private mode)
    }
  }, [items]);

  const addToCart = (course: CartItem) => {
    setItems((prev) => {
      if (prev.some((c) => c.id === course.id)) return prev;
      return [...prev, course];
    });
  };

  const removeFromCart = (id: string) =>
    setItems((prev) => prev.filter((c) => c.id !== id));

  const removeManyFromCart = (ids: string[]) => {
    const setIds = new Set(ids);
    setItems((prev) => prev.filter((c) => !setIds.has(c.id)));
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const getTotalPrice = useMemo(
    () => () => items.reduce((t, c) => t + c.price, 0),
    [items]
  );

  const getItemCount = useMemo(() => () => items.length, [items]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, removeManyFromCart, clearCart, getTotalPrice, getItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
