import { useState } from "react";
import { z } from "zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9 +\-()]+$/, "Only digits, spaces, +, -, ()"),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Please share a few details").max(1000),
});

export const InquiryForm = ({ productId, productName }: { productId?: string; productName?: string }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: productName ? `I'm interested in "${productName}". Please share more details.` : "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "inquiries"), {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        message: parsed.data.message,
        product_id: productId ?? null,
        status: "new",
        created_at: new Date().toISOString(),
      });
      toast.success("Inquiry sent — we'll be in touch shortly.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast.error("Could not send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full bg-input/60 border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          className={field}
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          maxLength={100}
          required
        />
        <input
          className={field}
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          maxLength={20}
          required
        />
      </div>
      <input
        className={field}
        type="email"
        placeholder="Email (optional)"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        maxLength={255}
      />
      <textarea
        className={`${field} min-h-[120px] resize-y`}
        placeholder="Tell us what you're looking for…"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        maxLength={1000}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-ember text-primary-foreground rounded-sm font-medium tracking-wide shadow-ember hover:brightness-110 transition disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Sending…" : "Send Inquiry"}
      </button>
      <p className="text-[11px] text-muted-foreground text-center">
        We respond within a few business hours. No spam, ever.
      </p>
    </form>
  );
};