import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, MessageCircle, Phone, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABEL, CategoryKey, resolveImage } from "@/lib/categories";
import { InquiryForm } from "@/components/site/InquiryForm";
import { ProductCard, ProductCardData } from "@/components/site/ProductCard";

interface Product extends ProductCardData {
  tags: string[];
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<ProductCardData[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (data) {
        setProduct(data as Product);
        document.title = `${data.name} — Kalpana Hardware`;
        const { data: rel } = await supabase
          .from("products")
          .select("*")
          .eq("category", data.category)
          .neq("id", id)
          .limit(4);
        setRelated((rel ?? []) as ProductCardData[]);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-32 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!product) {
    return (
      <div className="container py-32 text-center">
        <div className="font-display text-4xl">Product not found</div>
        <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
      </div>
    );
  }

  const images = product.images.length ? product.images : [""];
  const heroImg = resolveImage(images[activeImage], product.category as CategoryKey);

  const waMsg = encodeURIComponent(`Hello, I'm interested in "${product.name}". Please share more details.`);

  return (
    <div>
      <section className="container pt-10 md:pt-14">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
      </section>

      <section className="container py-10 md:py-16 grid lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-border bg-card">
            <img
              src={heroImg}
              alt={product.name}
              className="h-full w-full object-cover animate-float-up"
              key={activeImage}
            />
            {product.is_new && (
              <span className="absolute top-4 left-4 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] bg-gradient-ember text-primary-foreground rounded-sm">
                New Arrival
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden rounded-sm border ${i === activeImage ? "border-primary" : "border-border opacity-70 hover:opacity-100"} transition`}
                >
                  <img src={resolveImage(src, product.category as CategoryKey)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-4">
            {CATEGORY_LABEL[product.category as CategoryKey]}
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-[1.05]">
            {product.name}
          </h1>

          <div className="mt-6 flex items-center gap-3 text-sm">
            {product.in_stock ? (
              <span className="inline-flex items-center gap-1.5 text-primary">
                <Check className="h-4 w-4" /> In stock — ready to dispatch
              </span>
            ) : (
              <span className="text-muted-foreground">Currently out of stock</span>
            )}
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] border border-border bg-secondary/40 text-muted-foreground rounded-sm">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 border border-border bg-card rounded-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Pricing</div>
            <div className="font-display text-2xl">Inquire for best price</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trade & bulk discounts available for contractors and architects.
            </p>

            {product.category === "laminates" && (
              <Link
                to={`/visualizer?product=${product.id}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:opacity-80 transition"
              >
                <Sparkles className="h-4 w-4" /> Preview this laminate in your room
              </Link>
            )}

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <a
                href={`https://wa.me/910000000000?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-ember text-primary-foreground rounded-sm font-medium shadow-ember hover:brightness-110 transition"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href="tel:+910000000000"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-border hover:border-primary hover:text-primary rounded-sm font-medium transition"
              >
                <Phone className="h-4 w-4" /> Call store
              </a>
            </div>
          </div>

          <div className="mt-10">
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">Send an inquiry</div>
            <InquiryForm productId={product.id} productName={product.name} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container py-20 border-t border-border">
          <h2 className="font-display text-3xl md:text-4xl mb-8">More from {CATEGORY_LABEL[product.category as CategoryKey]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;