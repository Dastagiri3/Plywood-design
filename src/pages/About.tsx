import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero-warehouse.jpg";

const About = () => {
  useEffect(() => {
    document.title = "About — Kalpana Hardware";
  }, []);

  return (
    <div>
      <section className="relative min-h-[60vh] flex items-end overflow-hidden border-b border-border">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="container relative pb-16 md:pb-24">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">About us</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-balance max-w-3xl">
            Three generations. <span className="ember-text italic">One craft.</span>
          </h1>
        </div>
      </section>

      <section className="container py-20 md:py-28 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">Since 1978</div>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Built on relationships, not transactions.
          </h2>
        </div>
        <div className="md:col-span-7 space-y-5 text-muted-foreground leading-relaxed">
          <p>
            What started as a single doorframe workshop has grown into one of the
            region's most trusted suppliers of premium plywood, doors, kitchen sets
            and laminates. The faces have changed; the standard hasn't.
          </p>
          <p>
            We stock only what we'd use ourselves — ISI-grade BWP plywood, hand-finished
            entrance doors, hardware sourced from world-class brands. Every order is
            measured, advised on and dispatched by people who've been doing this for
            decades.
          </p>
          <p>
            Today, we work with builders, architects, contractors and homeowners on
            everything from single-door retrofits to 40-flat finish-outs.
          </p>
        </div>
      </section>

      <section className="container pb-24 md:pb-32 grid md:grid-cols-3 gap-5">
        {[
          { n: "47+", t: "Years in trade" },
          { n: "1,200+", t: "Projects supplied" },
          { n: "300+", t: "Curated SKUs in stock" },
        ].map((s) => (
          <div key={s.t} className="p-8 border border-border bg-card rounded-sm">
            <div className="font-display text-5xl md:text-6xl ember-text">{s.n}</div>
            <div className="mt-3 text-sm uppercase tracking-[0.18em] text-muted-foreground">{s.t}</div>
          </div>
        ))}
      </section>

      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-sm border border-border bg-card p-10 md:p-14 text-center">
          <div className="absolute inset-0 bg-radial-ember opacity-50" />
          <div className="relative">
            <h3 className="font-display text-3xl md:text-4xl text-balance">
              Visit the showroom — bring your drawings.
            </h3>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-ember text-primary-foreground rounded-sm font-medium shadow-ember hover:brightness-110 transition"
            >
              Plan a visit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;