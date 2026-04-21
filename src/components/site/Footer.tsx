import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-24">
      <div className="container py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-sm bg-gradient-ember grid place-items-center">
              <span className="font-display text-primary-foreground text-lg leading-none">K</span>
            </span>
            <div className="font-display text-xl">SPK Hardware</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            Three generations of trusted plywood, doors and finishing materials —
            crafted catalogs for builders, architects and homeowners.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <a href="tel:+910000000000" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition">
              <Phone className="h-4 w-4 text-primary" /> +91 00000 00000
            </a>
            <a href="mailto:hello@kalpanahardware.in" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition">
              <Mail className="h-4 w-4 text-primary" /> hello@kalpanahardware.in
            </a>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Near Bank of India, Kadapa Road, Khajipeta.
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Catalog</div>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.key}>
                <Link to={`/products?cat=${c.key}`} className="text-foreground/80 hover:text-primary transition">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Visit the showroom</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mon — Sat · 8:30 AM to 8:00 PM<br />
            Sunday · 8:30 AM to 12:00 PM
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-border hover:border-primary hover:text-primary rounded-sm transition"
          >
            Send an inquiry →
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} SPK Hardware. All rights reserved.</div>
          <div>Crafted with care · Built on Trust</div>
        </div>
      </div>
    </footer>
  );
};