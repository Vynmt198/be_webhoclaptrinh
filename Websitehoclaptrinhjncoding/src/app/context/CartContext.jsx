import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (course) => {
    setItems((prev) => {
      if (prev.some((c) => c.id === course.id)) return prev;
      return [...prev, course];
    });
  };

  const removeFromCart = (id) =>
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
