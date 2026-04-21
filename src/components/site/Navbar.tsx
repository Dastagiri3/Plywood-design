import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="relative h-9 w-9 rounded-sm bg-gradient-ember grid place-items-center shadow-ember">
            <span className="font-display text-primary-foreground text-lg leading-none">K</span>
            <span className="absolute inset-0 rounded-sm ring-1 ring-primary/40 group-hover:ring-primary/80 transition" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg md:text-xl tracking-tight">Kalpana Hardware</div>
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Plywood · Doors · Laminates
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium tracking-wide transition-colors relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-6 bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" /> Search catalog
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-3"
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
          <Link
            to="/contact"
            className="ml-3 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium bg-gradient-ember text-primary-foreground rounded-sm shadow-ember hover:brightness-110 transition"
          >
            Get a Quote
          </Link>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-3 text-base rounded-sm transition-colors",
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="mt-2 inline-flex items-center justify-center px-5 py-3 text-sm font-medium bg-gradient-ember text-primary-foreground rounded-sm"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};