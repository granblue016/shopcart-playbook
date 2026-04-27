import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "p-001",
    name: "Wireless Noise-Cancel Headphones",
    description: "Premium over-ear headphones with active noise cancellation and 30h battery.",
    price: 199.99,
    stock: 15,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    category: "Audio",
  },
  {
    id: "p-002",
    name: "Smart Fitness Watch",
    description: "Track workouts, heart rate, sleep and notifications with AMOLED display.",
    price: 149.0,
    stock: 8,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    category: "Wearables",
  },
  {
    id: "p-003",
    name: "Mechanical Keyboard RGB",
    description: "Hot-swappable mechanical keyboard with per-key RGB and aluminum frame.",
    price: 89.5,
    stock: 25,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    category: "Computing",
  },
  {
    id: "p-004",
    name: "4K Webcam Pro",
    description: "Ultra HD webcam with autofocus, dual mics and privacy shutter.",
    price: 119.0,
    stock: 0,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80",
    category: "Computing",
  },
  {
    id: "p-005",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof speaker with 360° sound and 24h playback.",
    price: 59.99,
    stock: 40,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
    category: "Audio",
  },
  {
    id: "p-006",
    name: "Ergonomic Wireless Mouse",
    description: "Silent clicks, rechargeable battery and customizable side buttons.",
    price: 39.99,
    stock: 3,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
    category: "Computing",
  },
  {
    id: "p-007",
    name: "USB-C Hub 8-in-1",
    description: "HDMI 4K, ethernet, SD card reader and 3 USB ports in one compact hub.",
    price: 49.0,
    stock: 12,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&q=80",
    category: "Accessories",
  },
  {
    id: "p-008",
    name: "Smart LED Desk Lamp",
    description: "Adjustable brightness, color temperature and built-in wireless charger.",
    price: 69.0,
    stock: 18,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
    category: "Home",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
