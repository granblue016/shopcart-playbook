import { Link, useRouter } from "@tanstack/react-router";
import { ShoppingCart, LogOut, Package, User as UserIcon } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.navigate({ to: "/" });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur"
      data-testid="app-header"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ShopCart</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
            data-testid="nav-products"
          >
            Products
          </Link>

          <Link to="/cart" data-testid="nav-cart">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
                  data-testid="cart-badge"
                >
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="hidden items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm sm:flex"
                data-testid="user-info"
              >
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium" data-testid="user-name">
                  {user.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login" data-testid="nav-login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
