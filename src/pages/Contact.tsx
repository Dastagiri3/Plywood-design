import { useEffect } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { InquiryForm } from "@/components/site/InquiryForm";

const Contact = () => {
  useEffect(() => {
    document.title = "Contact — Kalpana Hardware";
  }, []);

  return (
    <div>
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-radial-ember opacity-40" />
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="container relative py-20 md:py-28">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3">Get in touch</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-balance max-w-3xl">
            Tell us about your project.
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Whether it's a single door or a 40-flat finish-out, we'd love to quote it.
          </p>
        </div>
      </section>

      <section className="container py-16 md:py-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          {[
            { icon: Phone, t: "Call us", v: "+91 00000 00000", href: "tel:+910000000000" },
            { icon: MessageCircle, t: "WhatsApp", v: "Chat with the store", href: "https://wa.me/910000000000" },
            { icon: Mail, t: "Email", v: "hello@kalpanahardware.in", href: "mailto:hello@kalpanahardware.in" },
            { icon: MapPin, t: "Showroom", v: "Main Road, Industrial Area" },
            { icon: Clock, t: "Hours", v: "Mon–Sat · 9:30 AM – 8:00 PM" },
          ].map((c) => (
            <a
              key={c.t}
              href={c.href}
              className="group flex items-start gap-4 p-5 border border-border bg-card rounded-sm hover:border-primary/60 transition"
            >
              <div className="h-10 w-10 grid place-items-center rounded-sm bg-secondary group-hover:bg-gradient-ember transition">
                <c.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.t}</div>
                <div className="mt-1 text-foreground">{c.v}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="lg:col-span-7">
          <div className="p-6 md:p-10 border border-border bg-card rounded-sm">
            <h2 className="font-display text-3xl md:text-4xl">Send an inquiry</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We typically reply within a few business hours.
            </p>
            <div className="mt-6">
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;