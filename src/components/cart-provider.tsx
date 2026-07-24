"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartLine } from "@/types";

type PendingOrder = { orderId: string; expiresAt: string | null };

type CartContextValue = {
  lines: CartLine[];
  add: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  ready: boolean;
  pendingOrder: PendingOrder | null;
  setPendingOrder: (orderId: string, expiresAt: string | null) => void;
  clearPendingOrder: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const PENDING_ORDER_KEY = "natty-pending-order";

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  const time = new Date(expiresAt).getTime();
  return Number.isFinite(time) && time <= Date.now();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [pendingOrder, setPendingOrderState] = useState<PendingOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let storedLines: CartLine[] = [];

    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem("natty-cart") || "[]",
      );

      if (Array.isArray(stored)) {
        storedLines = stored.filter(
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
        );
      }
    } catch {
      // Carrinho inválido é descartado.
    }

    let storedPendingOrder: PendingOrder | null = null;

    try {
      const raw: unknown = JSON.parse(
        localStorage.getItem(PENDING_ORDER_KEY) || "null",
      );

      if (
        raw &&
        typeof raw === "object" &&
        "orderId" in raw &&
        typeof raw.orderId === "string"
      ) {
        storedPendingOrder = {
          orderId: raw.orderId,
          expiresAt:
            "expiresAt" in raw && typeof raw.expiresAt === "string"
              ? raw.expiresAt
              : null,
        };
      }
    } catch {
      // Pedido pendente inválido é descartado.
    }

    if (storedPendingOrder && isExpired(storedPendingOrder.expiresAt)) {
      // A reserva/Pix expirou enquanto o cliente estava fora do checkout:
      // o carrinho volta a ficar vazio, como se o cliente começasse de novo.
      storedPendingOrder = null;
      storedLines = [];
    }

    setLines(storedLines);
    setPendingOrderState(storedPendingOrder);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("natty-cart", JSON.stringify(lines));
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!ready) return;
    if (pendingOrder) {
      localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pendingOrder));
    } else {
      localStorage.removeItem(PENDING_ORDER_KEY);
    }
  }, [pendingOrder, ready]);

  useEffect(() => {
    if (!pendingOrder?.expiresAt) return;

    const msRemaining = new Date(pendingOrder.expiresAt).getTime() - Date.now();
    if (msRemaining <= 0) return;

    const id = setTimeout(() => {
      setPendingOrderState(null);
      setLines([]);
    }, msRemaining);

    return () => clearTimeout(id);
  }, [pendingOrder]);

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
    ready,
    pendingOrder,
    setPendingOrder: (orderId, expiresAt) =>
      setPendingOrderState({ orderId, expiresAt }),
    clearPendingOrder: () => setPendingOrderState(null),
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
