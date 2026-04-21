import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, Package, Inbox, LogOut, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/inquiries", label: "Inquiries", icon: Inbox, end: false },
];

export const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/auth", { replace: true });
    else if (!isAdmin) {
      toast.error("This account doesn't have admin access.");
      navigate("/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-card/40 flex-col">
        <Link to="/admin" className="flex items-center gap-3 px-6 h-16 border-b border-border">
          <span className="h-8 w-8 rounded-sm bg-gradient-ember grid place-items-center shadow-ember">
            <span className="font-display text-primary-foreground text-base leading-none">K</span>
          </span>
          <div className="leading-tight">
            <div className="font-display text-base">SPK</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-primary">Admin Panel</div>
          </div>
        </Link>

        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-foreground border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent"
                )
              }
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
          >
            <ExternalLink className="h-4 w-4" /> View site
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate("/auth");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <div className="px-3 pt-2 text-[11px] text-muted-foreground truncate">{user.email}</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-sm bg-gradient-ember grid place-items-center">
            <span className="font-display text-primary-foreground text-sm">K</span>
          </span>
          <span className="font-display text-sm">Admin</span>
        </Link>
        <button
          onClick={async () => {
            await signOut();
            navigate("/auth");
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border grid grid-cols-3">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="pb-20 md:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};