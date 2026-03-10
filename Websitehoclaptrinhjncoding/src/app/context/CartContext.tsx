import { createContext, useContext, useState, ReactNode } from "react";

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
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (course: CartItem) => {
    setItems((prev) => {
      if (prev.some((c) => c.id === course.id)) return prev;
      return [...prev, course];
    });
  };

  const removeFromCart = (id: string) =>
    setItems((prev) => prev.filter((c) => c.id !== id));

  const clearCart = () => setItems([]);

  const getTotalPrice = () =>
    items.reduce((t, c) => t + c.price, 0);

  const getItemCount = () => items.length;

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, getTotalPrice, getItemCount }}
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
