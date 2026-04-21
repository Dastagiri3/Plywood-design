import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_LABEL, CategoryKey, resolveImage } from "@/lib/categories";

export interface ProductCardData {
  id: string;
  name: string;
  category: CategoryKey;
  description: string;
  images: string[];
  in_stock: boolean;
  is_new: boolean;
  is_trending: boolean;
}

export const ProductCard = ({ p, index = 0 }: { p: ProductCardData; index?: number }) => {
  const img = resolveImage(p.images?.[0], p.category);
  return (
    <Link
      to={`/products/${p.id}`}
      className="group relative flex flex-col rounded-sm border border-border bg-card overflow-hidden hover:border-primary/60 transition-all duration-500 shadow-card animate-float-up"
      style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent opacity-80" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.is_new && (
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-gradient-ember text-primary-foreground rounded-sm">
              New
            </span>
          )}
          {p.is_trending && (
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-background/80 backdrop-blur text-foreground border border-border rounded-sm">
              Trending
            </span>
          )}
        </div>
        {!p.in_stock && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
            <span className="px-3 py-1.5 text-xs uppercase tracking-widest border border-border bg-card/80">
              Out of stock
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary mb-2">
          {CATEGORY_LABEL[p.category]}
        </div>
        <h3 className="font-display text-xl leading-tight text-foreground">{p.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">{p.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Inquire for price</span>
          <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};