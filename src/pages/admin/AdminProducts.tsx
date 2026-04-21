import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABEL, CategoryKey, resolveImage } from "@/lib/categories";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  category: CategoryKey;
  description: string;
  images: string[];
  in_stock: boolean;
  is_new: boolean;
  is_trending: boolean;
  tags: string[];
  created_at: string;
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [params] = useSearchParams();
  const filter = params.get("filter");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (filter === "new") list = list.filter((p) => p.is_new);
    if (filter === "trending") list = list.filter((p) => p.is_trending);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.description.toLowerCase().includes(t) ||
          CATEGORY_LABEL[p.category].toLowerCase().includes(t)
      );
    }
    return list;
  }, [products, q, filter]);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Catalog</div>
          <h1 className="font-display text-3xl md:text-4xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {filter ? ` · filtered: ${filter}` : ""}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-ember text-primary-foreground rounded-sm font-medium shadow-ember hover:brightness-110 transition"
        >
          <Plus className="h-4 w-4" /> New product
        </Link>
      </header>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-input/60 border border-border focus:border-primary outline-none rounded-sm pl-10 pr-4 py-2.5 text-sm transition"
        />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <p className="text-muted-foreground">No products found.</p>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline text-sm"
          >
            <Plus className="h-4 w-4" /> Add the first one
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <ul className="divide-y divide-border">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition"
              >
                <img
                  src={resolveImage(p.images?.[0], p.category)}
                  alt={p.name}
                  className="h-16 w-16 object-cover rounded-sm border border-border shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{p.name}</span>
                    {p.is_new && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-primary border border-primary/40 px-1.5 py-0.5 rounded-sm">
                        <Sparkles className="h-2.5 w-2.5" /> new
                      </span>
                    )}
                    {p.is_trending && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-foreground border border-border px-1.5 py-0.5 rounded-sm">
                        <TrendingUp className="h-2.5 w-2.5" /> trending
                      </span>
                    )}
                    {!p.in_stock && (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-destructive border border-destructive/40 px-1.5 py-0.5 rounded-sm">
                        out of stock
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {CATEGORY_LABEL[p.category]} · {p.images?.length ?? 0} image
                    {(p.images?.length ?? 0) === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/admin/products/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-sm hover:border-primary hover:text-primary transition"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => remove(p.id, p.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-sm hover:border-destructive hover:text-destructive transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;