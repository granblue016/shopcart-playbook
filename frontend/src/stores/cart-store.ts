import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";

interface AddResult {
  ok: boolean;
  reason?: "out_of_stock" | "exceeds_stock";
  message?: string;
}

interface CartState {
  items: CartItem[];
  discount: number;
  shippingFee: number;
  addItem: (product: Product, quantity?: number) => AddResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => AddResult;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
  hasStockIssue: () => boolean;
}

export const SHIPPING_FEE = 9.99;
export const FREE_SHIPPING_THRESHOLD = 200;
export const DISCOUNT_THRESHOLD = 150;
export const DISCOUNT_RATE = 0.1; // 10% off when subtotal >= threshold

function computeDiscount(subtotal: number) {
  return subtotal >= DISCOUNT_THRESHOLD
    ? Math.round(subtotal * DISCOUNT_RATE * 100) / 100
    : 0;
}

function computeShipping(subtotal: number) {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      shippingFee: 0,

      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) {
          return {
            ok: false,
            reason: "out_of_stock",
            message: `${product.name} is out of stock.`,
          };
        }
        const existing = get().items.find((i) => i.productId === product.id);
        const currentQty = existing?.quantity ?? 0;
        const newQty = currentQty + quantity;
        if (newQty > product.stock) {
          return {
            ok: false,
            reason: "exceeds_stock",
            message: `Only ${product.stock} units of ${product.name} available.`,
          };
        }
        let items: CartItem[];
        if (existing) {
          items = get().items.map((i) =>
            i.productId === product.id ? { ...i, quantity: newQty, stock: product.stock } : i,
          );
        } else {
          items = [
            ...get().items,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              stock: product.stock,
              image: product.image,
            },
          ];
        }
        const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
        set({
          items,
          discount: computeDiscount(sub),
          shippingFee: computeShipping(sub),
        });
        return { ok: true };
      },

      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId);
        const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
        set({
          items,
          discount: computeDiscount(sub),
          shippingFee: computeShipping(sub),
        });
      },

      updateQuantity: (productId, quantity) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return { ok: false, message: "Item not found" };
        if (quantity < 1) {
          get().removeItem(productId);
          return { ok: true };
        }
        if (quantity > item.stock) {
          return {
            ok: false,
            reason: "exceeds_stock",
            message: `Only ${item.stock} units available.`,
          };
        }
        const items = get().items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        );
        const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
        set({
          items,
          discount: computeDiscount(sub),
          shippingFee: computeShipping(sub),
        });
        return { ok: true };
      },

      clear: () => set({ items: [], discount: 0, shippingFee: 0 }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      total: () => {
        const sub = get().subtotal();
        return Math.max(0, sub - get().discount + get().shippingFee);
      },

      hasStockIssue: () => get().items.some((i) => i.quantity > i.stock),
    }),
    { name: "shopcart-cart" },
  ),
);
