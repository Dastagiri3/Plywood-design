import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Inbox, Sparkles, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { collection, getDocs, query, where, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { CATEGORY_LABEL } from "@/lib/categories";

type Inquiry = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
  product_id: string | null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, newProducts: 0, trending: 0, newInquiries: 0 });
  const [recent, setRecent] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const productsRef = collection(db, "products");
      const inquiriesRef = collection(db, "inquiries");
      const [totalSnap, newSnap, trendSnap, inqSnap, recSnap] = await Promise.all([
        getCountFromServer(productsRef),
        getCountFromServer(query(productsRef, where("is_new", "==", true))),
        getCountFromServer(query(productsRef, where("is_trending", "==", true))),
        getCountFromServer(query(inquiriesRef, where("status", "==", "new"))),
        getDocs(query(inquiriesRef, orderBy("created_at", "desc"), limit(5))),
      ]);
      setStats({
        products: totalSnap.data().count,
        newProducts: newSnap.data().count,
        trending: trendSnap.data().count,
        newInquiries: inqSnap.data().count,
      });
      setRecent(recSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Inquiry[]);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Total products", value: stats.products, icon: Package, to: "/admin/products" },
    { label: "New arrivals", value: stats.newProducts, icon: Sparkles, to: "/admin/products?filter=new" },
    { label: "Trending", value: stats.trending, icon: TrendingUp, to: "/admin/products?filter=trending" },
    { label: "New inquiries", value: stats.newInquiries, icon: Inbox, to: "/admin/inquiries" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <header className="mb-10">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Overview</div>
        <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Pulse of your catalog and customer interest.
        </p>
      </header>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {cards.map((c) => (
              <Link
                key={c.label}
                to={c.to}
                className="group relative bg-card border border-border rounded-sm p-5 hover:border-primary/60 transition shadow-card"
              >
                <div className="flex items-start justify-between">
                  <c.icon className="h-5 w-5 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                </div>
                <div className="mt-6">
                  <div className="font-display text-4xl">{c.value}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                    {c.label}
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <section className="bg-card border border-border rounded-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-xl">Recent inquiries</h2>
              <Link
                to="/admin/inquiries"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
              >
                View all →
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No inquiries yet.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((i) => (
                  <li key={i.id} className="p-5 hover:bg-secondary/30 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{i.name}</span>
                          {i.status === "new" && (
                            <span className="text-[10px] uppercase tracking-[0.18em] text-primary border border-primary/40 px-1.5 py-0.5 rounded-sm">
                              new
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{i.phone}</div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{i.message}</p>
                      </div>
                      <div className="text-[11px] text-muted-foreground shrink-0">
                        {new Date(i.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              to="/admin/products/new"
              className="group bg-gradient-ember text-primary-foreground rounded-sm p-6 shadow-ember"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] opacity-80">Quick action</div>
              <div className="font-display text-2xl mt-1">Add a product →</div>
              <p className="text-sm opacity-90 mt-2">
                Upload images, set category, mark as new arrival.
              </p>
            </Link>
            <Link
              to="/admin/products"
              className="group bg-card border border-border rounded-sm p-6 hover:border-primary/60 transition"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Manage</div>
              <div className="font-display text-2xl mt-1">Catalog →</div>
              <p className="text-sm text-muted-foreground mt-2">
                Across {Object.keys(CATEGORY_LABEL).length} categories.
              </p>
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;