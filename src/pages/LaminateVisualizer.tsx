import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type LaminateProduct = {
  id: string;
  name: string;
  category: "laminates";
  description: string;
  images: string[];
  tags: string[];
  in_stock: boolean;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read the image."));
    reader.readAsDataURL(file);
  });

const resizeImage = async (dataUrl: string, maxSide = 1600) => {
  const img = new Image();
  img.src = dataUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to prepare the image."));
  });

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing is unavailable in this browser.");

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
};

const urlToDataUrl = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await fileToDataUrl(new File([blob], "reference.jpg", { type: blob.type || "image/jpeg" }));
};

const LaminateVisualizer = () => {
  const [params] = useSearchParams();
  const preselectedId = params.get("product");

  const [products, setProducts] = useState<LaminateProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId);
  const [roomPreview, setRoomPreview] = useState<string | null>(null);
  const [roomImageData, setRoomImageData] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    document.title = "Laminate Visualizer — Kalpana Hardware";

    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, description, images, tags, in_stock")
        .eq("category", "laminates")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Could not load laminates",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } else {
        const items = (data ?? []) as LaminateProduct[];
        setProducts(items);
        if (!preselectedId && items[0]) setSelectedId(items[0].id);
      }

      setLoadingProducts(false);
    })();
  }, [preselectedId]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedId) ?? null,
    [products, selectedId],
  );

  const handleRoomUpload = async (file: File | undefined) => {
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      const resized = await resizeImage(dataUrl, 1600);
      setRoomPreview(resized);
      setRoomImageData(resized);
      setResultImage(null);
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Please try another image.",
        variant: "destructive",
      });
    }
  };

  const generatePreview = async () => {
    if (!roomImageData) {
      toast({
        title: "Upload a room photo",
        description: "Add a clear room image before generating a preview.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProduct) {
      toast({
        title: "Choose a laminate",
        description: "Select one laminate finish to visualize.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setResultImage(null);

    try {
      const laminateReferenceImage = await urlToDataUrl(resolveImage(selectedProduct.images[0], "laminates"));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/laminate-visualizer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          roomImage: roomImageData,
          laminateReferenceImage,
          laminateName: selectedProduct.name,
          notes: notes.trim() || undefined,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            (response.status === 429
              ? "Too many requests. Please wait a moment and try again."
              : response.status === 402
                ? "AI usage credits need attention before generating more previews."
                : "Could not generate the laminate preview."),
        );
      }

      if (!payload?.imageUrl) throw new Error("No preview image was returned.");

      setResultImage(payload.imageUrl);
      toast({
        title: "Preview ready",
        description: `Your ${selectedProduct.name} concept has been generated.`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-radial-ember opacity-35" />
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="container relative py-16 md:py-24">
          <Link to="/products?cat=laminates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-4 w-4" /> Back to laminates
          </Link>
          <div className="mt-6 text-[11px] uppercase tracking-[0.22em] text-primary">AI room preview</div>
          <h1 className="mt-3 font-display text-5xl md:text-6xl lg:text-7xl text-balance max-w-4xl">
            See a laminate finish inside your space before you inquire.
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground text-pretty leading-relaxed">
            Upload a room photo, pick a laminate from our library, and generate a styled preview that keeps the room structure intact while swapping the visible panel finish.
          </p>
        </div>
      </section>

      <section className="container py-12 md:py-16 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Step 1</div>
                <h2 className="font-display text-3xl md:text-4xl">Upload your room photo</h2>
              </div>
            </div>

            <label className="group flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 rounded-sm border border-dashed border-border bg-card/60 px-6 py-10 text-center transition hover:border-primary/50 hover:bg-card">
              <span className="grid h-14 w-14 place-items-center rounded-sm bg-secondary text-primary transition group-hover:bg-primary/10">
                <Upload className="h-6 w-6" />
              </span>
              <div>
                <div className="text-lg font-medium">Add a kitchen, wardrobe, or panel wall photo</div>
                <div className="mt-2 text-sm text-muted-foreground">Bright, front-facing images produce the cleanest laminate swap.</div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleRoomUpload(e.target.files?.[0])}
              />
              <span className="inline-flex items-center gap-2 text-sm text-primary">
                <ImagePlus className="h-4 w-4" /> Choose image
              </span>
            </label>
          </section>

          <section>
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Step 2</div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
              <div>
                <h2 className="font-display text-3xl md:text-4xl">Pick a laminate finish</h2>
                <p className="mt-2 text-sm text-muted-foreground">No prices shown — shortlist the finish you like and send an inquiry after previewing.</p>
              </div>
            </div>

            {loadingProducts ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-sm border border-border bg-card animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-sm border border-border bg-card/50 p-8 text-muted-foreground">
                Add laminate products in the admin panel to use the visualizer.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const selected = product.id === selectedId;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(product.id);
                        setResultImage(null);
                      }}
                      className={cn(
                        "group overflow-hidden rounded-sm border bg-card text-left transition",
                        selected ? "border-primary shadow-ember" : "border-border hover:border-primary/40",
                      )}
                    >
                      <div className="aspect-[4/5] overflow-hidden border-b border-border bg-secondary/40">
                        <img
                          src={resolveImage(product.images[0], "laminates")}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-display text-2xl leading-tight">{product.name}</div>
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Step 3</div>
            <h2 className="font-display text-3xl md:text-4xl">Optional guidance</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Example: apply only on lower cabinets, keep the wall paint unchanged, preserve the stone countertop."
              className="mt-4 min-h-28 rounded-sm border-input bg-card"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                onClick={generatePreview}
                disabled={generating || !roomImageData || !selectedProduct}
                className="rounded-sm bg-gradient-ember text-primary-foreground shadow-ember hover:brightness-110"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate preview
              </Button>
              {selectedProduct && (
                <Link
                  to={`/products/${selectedProduct.id}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
                >
                  View laminate details
                </Link>
              )}
            </div>
          </section>
        </div>

        <section className="lg:sticky lg:top-24">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2">Preview</div>
          <h2 className="font-display text-3xl md:text-4xl mb-5">Before & after</h2>
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="overflow-hidden rounded-sm border border-border bg-card/70">
              <div className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Original room</div>
              <div className="aspect-[4/5] bg-secondary/40">
                {roomPreview ? (
                  <img src={roomPreview} alt="Uploaded room preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
                    Upload a room photo to start the preview.
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-border bg-card/70">
              <div className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">AI laminate concept</div>
              <div className="aspect-[4/5] bg-secondary/40">
                {generating ? (
                  <div className="grid h-full place-items-center gap-3 px-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <div>
                      <div className="font-medium">Rendering your selected finish</div>
                      <div className="mt-1 text-sm text-muted-foreground">This usually takes under a minute.</div>
                    </div>
                  </div>
                ) : resultImage ? (
                  <img src={resultImage} alt="Generated laminate room concept" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
                    Your generated laminate preview will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedProduct && (
            <div className="mt-5 rounded-sm border border-border bg-card/60 p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Selected finish</div>
              <div className="mt-2 font-display text-3xl">{selectedProduct.name}</div>
              <p className="mt-2 text-sm text-muted-foreground">{selectedProduct.description}</p>
              <Link
                to={`/products/${selectedProduct.id}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:opacity-80 transition"
              >
                Send inquiry for this laminate
              </Link>
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default LaminateVisualizer;