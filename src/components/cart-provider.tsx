"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartLine } from "@/types";

type CartContextValue = {
  lines: CartLine[];
  add: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem("natty-cart") || "[]",
      );

      if (Array.isArray(stored)) {
        setLines(
          stored.filter(
            (line): line is CartLine =>
              typeof line === "object" &&
              line !== null &&
              "productId" in line &&
              typeof line.productId === "string" &&
              "quantity" in line &&
              typeof line.quantity === "number" &&
              Number.isInteger(line.quantity) &&
              line.quantity > 0 &&
              line.quantity <= 99,
          ),
        );
      }
    } catch {
      // Carrinho inválido é descartado.
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("natty-cart", JSON.stringify(lines));
    }
  }, [lines, ready]);

  const normalize = (quantity: number) =>
    Number.isFinite(quantity)
      ? Math.max(0, Math.min(99, Math.floor(quantity)))
      : 0;

  const setQuantity = (id: string, quantity: number) =>
    setLines((current) =>
      normalize(quantity) <= 0
        ? current.filter((line) => line.productId !== id)
        : current.map((line) =>
            line.productId === id
              ? { ...line, quantity: normalize(quantity) }
              : line,
          ),
    );

  const add = (id: string) =>
    setLines((current) => {
      const found = current.find((line) => line.productId === id);

      if (found) {
        return current.map((line) =>
          line.productId === id
            ? { ...line, quantity: normalize(line.quantity + 1) }
            : line,
        );
      }

      return [...current, { productId: id, quantity: 1 }];
    });

  const value: CartContextValue = {
    lines,
    add,
    setQuantity,
    remove: (id) =>
      setLines((current) =>
        current.filter((line) => line.productId !== id),
      ),
    clear: () => setLines([]),
    count: lines.reduce((total, line) => total + line.quantity, 0),
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart fora do provider");
  }

  return value;
}
