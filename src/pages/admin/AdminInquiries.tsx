import { useEffect, useMemo, useState } from "react";
import { Loader2, Phone, Mail, Package, Check, Archive, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, doc, getDocs, updateDoc, query, orderBy, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  product_id: string | null;
  status: string;
  created_at: string;
};

type ProductLite = { id: string; name: string };

const STATUSES = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "responded", label: "Responded" },
  { key: "archived", label: "Archived" },
];

const AdminInquiries = () => {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [products, setProducts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDocs(query(collection(db, "inquiries"), orderBy("created_at", "desc")));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Inquiry[];
      setItems(list);

      const ids = Array.from(new Set(list.map((i) => i.product_id).filter(Boolean))) as string[];
      if (ids.length) {
        const map: Record<string, string> = {};
        await Promise.all(
          ids.map(async (pid) => {
            const pSnap = await getDoc(doc(db, "products", pid));
            if (pSnap.exists()) map[pid] = (pSnap.data() as { name: string }).name;
          })
        );
        setProducts(map);
      }
      setLoading(false);
    })();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const prev = items;
    setItems((it) => it.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await updateDoc(doc(db, "inquiries", id), { status });
      toast.success(`Marked as ${status}`);
    } catch {
      setItems(prev);
      toast.error("Failed to update status");
    }
  };

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "all") list = list.filter((i) => i.status === tab);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(t) ||
          i.phone.toLowerCase().includes(t) ||
          (i.email ?? "").toLowerCase().includes(t) ||
          i.message.toLowerCase().includes(t)
      );
    }
    return list;
  }, [items, tab, q]);

  const counts = useMemo(
    () => ({
      all: items.length,
      new: items.filter((i) => i.status === "new").length,
      responded: items.filter((i) => i.status === "responded").length,
      archived: items.filter((i) => i.status === "archived").length,
    }),
    [items]
  );

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <header className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Customers</div>
        <h1 className="font-display text-3xl md:text-4xl">Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Quote requests and product questions from your site.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={cn(
              "px-3 py-1.5 text-xs uppercase tracking-[0.16em] rounded-sm border transition",
              tab === s.key
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}{" "}
            <span className="ml-1 opacity-60">{counts[s.key as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search inquiries…"
          className="w-full bg-input/60 border border-border focus:border-primary outline-none rounded-sm pl-10 pr-4 py-2.5 text-sm transition"
        />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-sm p-12 text-center text-muted-foreground">
          No inquiries here.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((i) => (
            <li
              key={i.id}
              className="bg-card border border-border rounded-sm p-5 hover:border-primary/40 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg">{i.name}</h3>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm border",
                        i.status === "new" && "text-primary border-primary/40",
                        i.status === "responded" && "text-foreground border-border",
                        i.status === "archived" && "text-muted-foreground border-border"
                      )}
                    >
                      {i.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <a
                      href={`tel:${i.phone}`}
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Phone className="h-3 w-3" /> {i.phone}
                    </a>
                    {i.email && (
                      <a
                        href={`mailto:${i.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-foreground"
                      >
                        <Mail className="h-3 w-3" /> {i.email}
                      </a>
                    )}
                    {i.product_id && products[i.product_id] && (
                      <Link
                        to={`/products/${i.product_id}`}
                        className="inline-flex items-center gap-1.5 hover:text-primary"
                      >
                        <Package className="h-3 w-3" /> {products[i.product_id]}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(i.created_at).toLocaleString()}
                </div>
              </div>

              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{i.message}</p>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                {i.status !== "responded" && (
                  <button
                    onClick={() => setStatus(i.id, "responded")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-sm hover:border-primary hover:text-primary transition"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark responded
                  </button>
                )}
                {i.status !== "archived" && (
                  <button
                    onClick={() => setStatus(i.id, "archived")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-sm hover:border-foreground transition"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                )}
                {i.status !== "new" && (
                  <button
                    onClick={() => setStatus(i.id, "new")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    Reset to new
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminInquiries;