import { useState } from "react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils-format";
import { toast } from "sonner";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const itemInCart = useCartStore((s) =>
    s.items.find((i) => i.productId === product.id),
  );
  const [error, setError] = useState<string | null>(null);

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    setError(null);
    const result = addItem(product);
    if (!result.ok) {
      setError(result.message ?? "Could not add to cart");
      toast.error(result.message ?? "Could not add to cart");
      return;
    }
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Card
      className="group flex flex-col overflow-hidden border-border transition-shadow hover:shadow-lg"
      data-testid="product-card"
      data-product-id={product.id}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-testid="product-image"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
            <h3
              className="mt-0.5 line-clamp-2 text-base font-semibold leading-tight"
              data-testid="product-name"
            >
              {product.name}
            </h3>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-xl font-bold tracking-tight"
              data-testid="product-price"
            >
              {formatCurrency(product.price)}
            </span>
            {outOfStock ? (
              <span
                className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive"
                data-testid="stock-status"
                data-stock-state="out"
              >
                Out of Stock
              </span>
            ) : lowStock ? (
              <span
                className="rounded-md bg-warning/15 px-2 py-1 text-xs font-semibold text-warning-foreground"
                data-testid="stock-status"
                data-stock-state="low"
              >
                {product.stock} in stock
              </span>
            ) : (
              <span
                className="rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success"
                data-testid="stock-status"
                data-stock-state="in"
              >
                {product.stock} in stock
              </span>
            )}
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive"
              data-testid="product-error"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className="w-full"
            disabled={outOfStock}
            onClick={handleAdd}
            data-testid="add-to-cart-btn"
            data-product-id={product.id}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {outOfStock
              ? "Unavailable"
              : itemInCart
                ? `In cart (${itemInCart.quantity})`
                : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
