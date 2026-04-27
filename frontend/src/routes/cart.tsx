import { createFileRoute, Link } from "@tanstack/react-router";
import { useCartStore, DISCOUNT_THRESHOLD, FREE_SHIPPING_THRESHOLD } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils-format";
import { toast } from "sonner";
import { Trash2, AlertTriangle, ShoppingBag, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ShopCart" },
      { name: "description", content: "Review your cart and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount);
  const shippingFee = useCartStore((s) => s.shippingFee);
  const total = useCartStore((s) => s.total());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hasStockIssue = useCartStore((s) => s.hasStockIssue());

  const handleQuantityChange = (productId: string, raw: string) => {
    const qty = parseInt(raw, 10);
    if (isNaN(qty)) return;
    const result = updateQuantity(productId, qty);
    if (!result.ok && result.message) toast.error(result.message);
  };

  const handleStep = (productId: string, currentQty: number, delta: number) => {
    const result = updateQuantity(productId, currentQty + delta);
    if (!result.ok && result.message) toast.error(result.message);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center" data-testid="empty-cart">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our catalog and add some products to get started.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button data-testid="continue-shopping-btn">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Your Cart</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3" data-testid="cart-items">
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;
            const exceeds = item.quantity > item.stock;
            return (
              <Card
                key={item.productId}
                className="flex gap-4 p-4"
                data-testid="cart-item-row"
                data-product-id={item.productId}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 shrink-0 rounded-md object-cover"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight" data-testid="cart-item-name">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(item.price)} each · {item.stock} in stock
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeItem(item.productId);
                        toast.success(`${item.name} removed`);
                      }}
                      data-testid="remove-item-btn"
                      data-product-id={item.productId}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {exceeds && (
                    <div
                      className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                      data-testid="stock-warning"
                      data-product-id={item.productId}
                      role="alert"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Quantity exceeds available stock ({item.stock}).
                    </div>
                  )}

                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStep(item.productId, item.quantity, -1)}
                        data-testid="decrease-qty-btn"
                        data-product-id={item.productId}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        className="h-8 w-16 text-center"
                        data-testid="item-quantity-input"
                        data-product-id={item.productId}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStep(item.productId, item.quantity, 1)}
                        data-testid="increase-qty-btn"
                        data-product-id={item.productId}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div
                      className="text-right font-semibold"
                      data-testid="line-total"
                      data-product-id={item.productId}
                    >
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card className="h-fit p-6" data-testid="cart-summary">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium" data-testid="subtotal-price">
                {formatCurrency(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Discount {discount > 0 && <span className="text-success">(10% off)</span>}
              </dt>
              <dd className="font-medium text-success" data-testid="discount-amount">
                -{formatCurrency(discount)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium" data-testid="shipping-fee">
                {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
              </dd>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <dt className="text-base font-semibold">Total</dt>
                <dd className="text-lg font-bold tracking-tight" data-testid="grand-total">
                  {formatCurrency(total)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            {subtotal < DISCOUNT_THRESHOLD && (
              <p data-testid="discount-hint">
                Spend {formatCurrency(DISCOUNT_THRESHOLD - subtotal)} more to unlock 10% off.
              </p>
            )}
            {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
              <p data-testid="shipping-hint">
                Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
              </p>
            )}
          </div>

          {hasStockIssue && (
            <div
              className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              data-testid="checkout-blocked-warning"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>One or more items exceed available stock. Adjust quantities to checkout.</span>
            </div>
          )}

          {hasStockIssue ? (
            <Button className="mt-6 w-full" size="lg" disabled data-testid="checkout-btn">
              Proceed to Checkout
            </Button>
          ) : (
            <Link to="/checkout" className="mt-6 block">
              <Button className="w-full" size="lg" data-testid="checkout-btn">
                Proceed to Checkout
              </Button>
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}
