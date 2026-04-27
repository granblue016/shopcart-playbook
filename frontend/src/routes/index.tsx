import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopCart — Browse Products" },
      {
        name: "description",
        content: "Browse our catalog of electronics, accessories, and more.",
      },
    ],
  }),
  component: ProductsPage,
});

const CATEGORIES = ["All", "Audio", "Wearables", "Computing", "Accessories", "Home"];

function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesQuery =
        query.trim() === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Hero */}
      <section className="mb-10">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Quality gear, predictable checkout.
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/85">
            ShopCart brings you a curated catalog with transparent pricing, real-time stock, and a
            smooth checkout experience.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
            data-testid="product-search-input"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              data-testid="category-filter-btn"
              data-category={cat}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-testid="product-grid"
      >
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </section>

      {filtered.length === 0 && (
        <div
          className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground"
          data-testid="empty-products"
        >
          No products match your filters.
        </div>
      )}
    </div>
  );
}
