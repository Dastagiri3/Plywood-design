import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Hammer, Sparkles, WandSparkles } from "lucide-react";
import hero from "@/assets/hero-warehouse.jpg";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, ProductCardData } from "@/components/site/ProductCard";

const Index = () => {
  const [newArrivals, setNewArrivals] = useState<ProductCardData[]>([]);
  const [trending, setTrending] = useState<ProductCardData[]>([]);

  useEffect(() => {
    document.title = "Kalpana Hardware — Plywood, Doors & Laminates";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Premium plywood, doors, hinges, kitchen sets and laminates. Crafted catalog, three generations of trust.");

    (async () => {
      const [{ data: news }, { data: trend }] = await Promise.all([
        supabase.from("products").select("*").eq("is_new", true).order("created_at", { ascending: false }).limit(8),
        supabase.from("products").select("*").eq("is_trending", true).order("created_at", { ascending: false }).limit(4),
      ]);
      setNewArrivals((news ?? []) as ProductCardData[]);
      setTrending((trend ?? []) as ProductCardData[]);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <img
          src={hero}
          alt="Premium plywood and wooden doors in a warehouse"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-radial-ember opacity-60" />
        <div className="absolute inset-0 grid-lines opacity-40" />

        <div className="container relative z-10 pb-20 md:pb-28">
          <div className="max-w-3xl animate-float-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-card/40 backdrop-blur rounded-sm text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ember-pulse" />
              Est. 1978 · Three generations of craft
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[0.95] text-balance">
              Built to last.
              <br />
              <span className="ember-text italic">Finished to inspire.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Marine-grade plywood, hand-finished doors, modular kitchens and a curated
              library of laminates — sourced and stocked for builders, architects and
              discerning homeowners.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 px-7 py-4 bg-gradient-ember text-primary-foreground rounded-sm font-medium tracking-wide shadow-ember hover:brightness-110 transition"
              >
                Explore the catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-4 border border-border bg-card/30 backdrop-blur hover:bg-card/60 rounded-sm font-medium tracking-wide transition"
              >
                Request a quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-card/40">
        <div className="container grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { icon: ShieldCheck, t: "ISI 710 grade", s: "Genuine BWP plywood only" },
            { icon: Truck, t: "Same-city delivery", s: "Bulk orders dispatched daily" },
            { icon: Hammer, t: "Trade pricing", s: "Contractors & architects" },
            { icon: Sparkles, t: "Curated finishes", s: "Hand-picked laminate library" },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3 px-4 md:px-8 py-6">
              <f.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">{f.t}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">01 — The Catalog</div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance max-w-2xl">
              Everything that goes into a beautifully built home.
            </h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition shrink-0">
            See all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.key}
              to={`/products?cat=${c.key}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm border border-border bg-card animate-float-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={c.image}
                alt={c.label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="font-display text-2xl md:text-3xl">{c.label}</div>
                <div className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition">
                  {c.blurb} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="relative py-24 md:py-32 border-t border-border bg-card/30">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">02 — Just In</div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance">
                  New arrivals, freshly stocked.
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {newArrivals.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="container py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">03 — Trending</div>
                <h2 className="font-display text-4xl md:text-5xl text-balance">
                  What architects are <span className="ember-text italic">specifying</span> this season.
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  Every piece in our trending selection has been hand-picked by our team
                  and tested across recent projects.
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition"
                >
                  Browse the full library <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {trending.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-border bg-card/30">
        <div className="container py-16 md:py-20 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary mb-4">
              <WandSparkles className="h-4 w-4" /> 04 — Visualize Laminates
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-balance max-w-2xl">
              Upload your room and test laminate finishes before you inquire.
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground leading-relaxed">
              Compare woodgrains, mattes and statement surfaces in your own kitchen or wardrobe photo with an AI-generated concept preview.
            </p>
          </div>

          <div className="flex lg:justify-end">
            <Link
              to="/visualizer"
              className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-ember text-primary-foreground rounded-sm font-medium tracking-wide shadow-ember hover:brightness-110 transition"
            >
              Open laminate visualizer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24 md:pb-32">
        <div className="relative overflow-hidden rounded-sm border border-border bg-card p-10 md:p-16">
          <div className="absolute inset-0 bg-radial-ember opacity-50" />
          <div className="absolute inset-0 grid-lines opacity-30" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">Let's build together</div>
              <h3 className="font-display text-4xl md:text-5xl text-balance">
                Send us your BOQ. We'll send back a quote within hours.
              </h3>
            </div>
            <div className="flex md:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-ember text-primary-foreground rounded-sm font-medium tracking-wide shadow-ember hover:brightness-110 transition"
              >
                Start an inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
