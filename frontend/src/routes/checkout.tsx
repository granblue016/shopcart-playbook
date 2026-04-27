import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatCurrency, generateOrderId } from "@/lib/utils-format";
import { toast } from "sonner";
import { CheckCircle2, Lock, Package } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ShopCart" },
      { name: "description", content: "Enter shipping info to complete your order." },
    ],
  }),
  component: CheckoutPage,
});

const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(200),
  city: z.string().trim().min(2, "City is required").max(80),
  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code is required")
    .max(20)
    .regex(/^[A-Za-z0-9 -]+$/, "Invalid postal code"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone is required")
    .max(20)
    .regex(/^[+0-9 ()-]+$/, "Invalid phone number"),
});

type ShippingForm = z.infer<typeof shippingSchema>;

function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount);
  const shippingFee = useCartStore((s) => s.shippingFee);
  const total = useCartStore((s) => s.total());
  const hasStockIssue = useCartStore((s) => s.hasStockIssue());
  const clearCart = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState<ShippingForm>({
    fullName: user?.name ?? "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  if (items.length === 0 && !orderId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center" data-testid="empty-checkout">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items before checking out.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16" data-testid="order-success">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Order placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for your purchase. We've sent a confirmation email.
          </p>
          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order ID
            </p>
            <p className="mt-1 font-mono text-base font-semibold" data-testid="order-id-display">
              {orderId}
            </p>
          </div>
          <Link to="/" className="mt-6 inline-block w-full">
            <Button className="w-full" data-testid="back-to-shop-btn">
              Continue Shopping
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const update = (key: keyof ShippingForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const parsed = shippingSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrs: Partial<Record<keyof ShippingForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ShippingForm;
        if (!fieldErrs[k]) fieldErrs[k] = issue.message;
      }
      setErrors(fieldErrs);
      toast.error("Please fix the form errors");
      return;
    }

    if (hasStockIssue) {
      setApiError("Some items exceed available stock.");
      toast.error("Stock conflict — please adjust your cart.");
      return;
    }

    setSubmitting(true);
    try {
      // Simulated network call — predictable for E2E tests
      await new Promise((r) => setTimeout(r, 600));
      const id = generateOrderId();
      setOrderId(id);
      clearCart();
      toast.success("Order placed successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Checkout failed";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Shipping Information</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-testid="checkout-form"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                data-testid="shipping-fullname-input"
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive" data-testid="error-fullName">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                data-testid="shipping-address-input"
                aria-invalid={!!errors.address}
              />
              {errors.address && (
                <p className="text-xs text-destructive" data-testid="error-address">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  data-testid="shipping-city-input"
                  aria-invalid={!!errors.city}
                />
                {errors.city && (
                  <p className="text-xs text-destructive" data-testid="error-city">
                    {errors.city}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  data-testid="shipping-postal-input"
                  aria-invalid={!!errors.postalCode}
                />
                {errors.postalCode && (
                  <p className="text-xs text-destructive" data-testid="error-postalCode">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                data-testid="shipping-phone-input"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-xs text-destructive" data-testid="error-phone">
                  {errors.phone}
                </p>
              )}
            </div>

            {apiError && (
              <div
                className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                data-testid="checkout-api-error"
                role="alert"
              >
                {apiError}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting || hasStockIssue}
              data-testid="place-order-btn"
            >
              <Lock className="mr-2 h-4 w-4" />
              {submitting ? "Placing order..." : `Place order · ${formatCurrency(total)}`}
            </Button>
          </form>
        </Card>

        {/* Mini summary */}
        <Card className="h-fit p-6" data-testid="checkout-summary">
          <h2 className="text-lg font-semibold">Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li
                key={i.productId}
                className="flex justify-between gap-2"
                data-testid="summary-item"
                data-product-id={i.productId}
              >
                <span className="text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-medium">{formatCurrency(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd data-testid="subtotal-price">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="text-success">-{formatCurrency(discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd data-testid="shipping-fee">
                {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="text-lg font-bold" data-testid="grand-total">
                {formatCurrency(total)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
