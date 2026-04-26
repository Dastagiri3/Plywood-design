import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/integrations/firebase/client";
import { CATEGORIES, CategoryKey, resolveImage } from "@/lib/categories";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  category: z.enum([
    "doors",
    "plywood",
    "hinges",
    "kitchen_sets",
    "laminates",
    "cupboard_materials",
    "hardware",
  ]),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  tags: z.string().max(500).optional(),
});

const empty = {
  name: "",
  category: "plywood" as CategoryKey,
  description: "",
  tags: "",
  in_stock: true,
  is_new: false,
  is_trending: false,
  images: [] as string[],
};

const AdminProductForm = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const snap = await getDoc(doc(db, "products", id!));
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          name: data.name,
          category: data.category as CategoryKey,
          description: data.description,
          tags: (data.tags ?? []).join(", "),
          in_stock: data.in_stock,
          is_new: data.is_new,
          is_trending: data.is_trending,
          images: data.images ?? [],
        });
      } else {
        toast.error("Product not found");
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploaded.push(url);
      } catch {
        toast.error(`Upload failed for ${file.name}`);
      }
    }
    setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false);
    if (uploaded.length) toast.success(`${uploaded.length} image(s) uploaded`);
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      name: form.name,
      category: form.category,
      description: form.description,
      tags: form.tags,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSaving(true);
    const payload = {
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description,
      tags: (parsed.data.tags ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      in_stock: form.in_stock,
      is_new: form.is_new,
      is_trending: form.is_trending,
      images: form.images,
    };
    try {
      if (isNew) {
        await addDoc(collection(db, "products"), {
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        toast.success("Product created");
      } else {
        await updateDoc(doc(db, "products", id!), {
          ...payload,
          updated_at: new Date().toISOString(),
        });
        toast.success("Product updated");
      }
      navigate("/admin/products");
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const field =
    "w-full bg-input/60 border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-sm transition";
  const labelCls = "block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2";

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="h-3 w-3" /> All products
      </Link>

      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">
          {isNew ? "New" : "Edit"}
        </div>
        <h1 className="font-display text-3xl md:text-4xl">
          {isNew ? "Add a product" : form.name || "Edit product"}
        </h1>
      </header>

      <form onSubmit={submit} className="space-y-6 bg-card border border-border rounded-sm p-6 md:p-8">
        <div>
          <label className={labelCls}>Name</label>
          <input
            className={field}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={120}
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select
              className={field}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as CategoryKey })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input
              className={field}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="bwp, marine, 18mm"
              maxLength={500}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            className={`${field} min-h-[140px] resize-y`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={2000}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {form.images.map((url) => (
              <div
                key={url}
                className="relative aspect-square rounded-sm overflow-hidden border border-border group"
              >
                <img
                  src={resolveImage(url, form.category)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1.5 right-1.5 h-7 w-7 grid place-items-center bg-background/80 backdrop-blur border border-border rounded-sm opacity-0 group-hover:opacity-100 hover:border-destructive hover:text-destructive transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <label
              className={`aspect-square rounded-sm border border-dashed border-border hover:border-primary/60 hover:text-primary transition cursor-pointer grid place-items-center text-muted-foreground ${
                uploading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="text-center">
                  <Upload className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-[11px] uppercase tracking-[0.18em]">Upload</span>
                </div>
              )}
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            JPG, PNG or WebP · up to 5MB each.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { key: "in_stock", label: "In stock" },
            { key: "is_new", label: "New arrival" },
            { key: "is_trending", label: "Trending" },
          ].map((t) => (
            <label
              key={t.key}
              className="flex items-center gap-3 px-4 py-3 bg-input/40 border border-border rounded-sm cursor-pointer hover:border-primary/60 transition"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={form[t.key as keyof typeof form] as boolean}
                onChange={(e) => setForm({ ...form, [t.key]: e.target.checked })}
              />
              <span className="text-sm">{t.label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-ember text-primary-foreground rounded-sm font-medium shadow-ember hover:brightness-110 transition disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isNew ? "Create product" : "Save changes"}
          </button>
          <Link
            to="/admin/products"
            className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

// serverTimestamp imported but not used inline since we use ISO strings for consistency
// eslint-disable-next-line @typescript-eslint/no-unused-vars
void serverTimestamp;

export default AdminProductForm;