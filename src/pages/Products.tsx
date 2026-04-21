import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CategoryKey } from "@/lib/categories";
import { ProductCard, ProductCardData } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";

const Products = () => {
  const [params, setParams] = useSearchParams();
  const cat = (params.get("cat") as CategoryKey | null) ?? null;
  const q = params.get("q") ?? "";
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);

  useEffect(() => {
    document.title = "Catalog — Kalpana Hardware";
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (cat) query = query.eq("category", cat);
      const { data } = await query;
      if (!active) return;
      setItems((data ?? []) as ProductCardData[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [cat]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const needle = q.toLowerCase();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle),
    );
  }, [items, q]);

  const setCat = (next: CategoryKey | null) => {
    const np = new URLSearchParams(params);
    if (next) np.set("cat", next);
    else np.delete("cat");
    setParams(np, { replace: true });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const np = new URLSearchParams(params);
    if (search.trim()) np.set("q", search.trim());
    else np.delete("q");
    setParams(np, { replace: true });
  };

  return (
    <div>
      {/* Header */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-radial-ember opacity-40" />
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="container relative py-16 md:py-24">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">Catalog</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-balance max-w-3xl">
            The complete library.
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Filter by category or search by name. All prices on inquiry —
            we tailor quotes to your project size.
          </p>

          <form onSubmit={submitSearch} className="mt-8 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plywood, doors, laminates…"
              className="w-full bg-card border border-border focus:border-primary outline-none rounded-sm pl-11 pr-4 py-3.5 text-sm transition"
            />
          </form>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCat(null)}
            className={cn(
              "px-4 py-2 text-xs uppercase tracking-[0.18em] rounded-sm border transition shrink-0",
              !cat ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={cn(
                "px-4 py-2 text-xs uppercase tracking-[0.18em] rounded-sm border transition shrink-0",
                cat === c.key
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              )}
            >
              {c.label}
            </button>
          ))}
          {q && (
            <button
              onClick={() => {
                const np = new URLSearchParams(params);
                np.delete("q");
                setSearch("");
                setParams(np, { replace: true });
              }}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs text-primary border border-primary/40 rounded-sm shrink-0"
            >
              "{q}" <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="container py-14 md:py-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-sm bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="font-display text-3xl">Nothing matches that yet.</div>
            <p className="mt-3 text-muted-foreground">
              Try a different category or contact us — we likely stock it.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing <span className="text-foreground">{filtered.length}</span> {filtered.length === 1 ? "product" : "products"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Products;