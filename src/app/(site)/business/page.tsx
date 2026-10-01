import type { Metadata } from "next";
import {
  ArrowRight,
  BadgePercent,
  Building2,
  ClipboardList,
  Factory,
  FileText,
  GraduationCap,
  Hospital,
  Mail,
  PackageCheck,
  Palette,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
  Warehouse,
  Dumbbell,
  Landmark,
} from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { WpForm } from "@/components/forms/wp-form";
import { loadWpForm } from "@/lib/wpforms";
import { uploadsUrl } from "@/lib/uploads";

export const metadata: Metadata = {
  title: "Business & Bulk Orders | Raj & Raj",
  description:
    "Steel lockers, storage, wardrobes and office furniture in bulk for offices, factories, schools, hospitals and institutions. Get a quote from the Raj & Raj B2B team.",
};

// Re-read the WPForms form periodically so wp-admin edits show up.
export const revalidate = 300;

const SALES_PHONE = { display: "+91 33 4800 0018", href: "tel:+913348000018" };
const SALES_EMAIL = "sales@rajandraj.co";

const stats = [
  { value: "56+", label: "Years of excellence" },
  { value: "500+", label: "Corporate clients" },
  { value: "10,000+", label: "Customers served" },
  { value: "30+", label: "Products" },
];

const industries = [
  { Icon: Building2, title: "Offices & corporates", text: "Lockers, filing and storage for teams of every size." },
  { Icon: Factory, title: "Factories & plants", text: "Heavy-duty worker lockers and tool storage." },
  { Icon: Warehouse, title: "Warehouses & logistics", text: "Durable storage built for high-traffic floors." },
  { Icon: GraduationCap, title: "Schools & colleges", text: "Student lockers, staff room and library storage." },
  { Icon: Hospital, title: "Hospitals & clinics", text: "First aid boxes, staff lockers and records storage." },
  { Icon: Dumbbell, title: "Gyms & hostels", text: "Secure personal lockers and wardrobes." },
  { Icon: Landmark, title: "Government & PSUs", text: "Compliant documentation and procurement support." },
  { Icon: Palette, title: "Retail & hospitality", text: "Back-of-house storage and staff wardrobes." },
];

const benefits = [
  { Icon: BadgePercent, title: "Volume pricing", text: "Tiered pricing for bulk and repeat orders." },
  { Icon: Palette, title: "Custom sizes & colours", text: "Configurations, finishes and branding to match your space." },
  { Icon: FileText, title: "GST invoicing", text: "Proper GST invoices and documentation for procurement." },
  { Icon: Truck, title: "Delivery & installation", text: "Coordinated dispatch and on-site installation." },
  { Icon: ShieldCheck, title: "Built to last", text: "Quality steel construction backed by warranty support." },
  { Icon: UserRound, title: "Dedicated contact", text: "One point of contact from quote to delivery." },
];

const steps = [
  { Icon: ClipboardList, title: "Share your requirement", text: "Tell us what you need, quantities and timelines." },
  { Icon: FileText, title: "Get a tailored quote", text: "We recommend the right products and send pricing." },
  { Icon: Factory, title: "Manufacturing", text: "Your order is produced and quality-checked." },
  { Icon: PackageCheck, title: "Delivery & setup", text: "Delivered and installed at your site." },
];

export default async function BusinessPage() {
  const loaded = await loadWpForm("business");

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#111] pt-32 pb-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-[color:var(--brand)]/30 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--brand)]" />
              Raj &amp; Raj for Business
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Steel furniture,{" "}
              <span className="text-[color:var(--brand)]">built for scale.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Lockers, storage, wardrobes and office furniture for offices,
              factories, institutions and projects of every size, with volume
              pricing and end-to-end support from our B2B team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(221,51,51,0.45)] transition hover:brightness-110"
              >
                Get a quote <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={SALES_PHONE.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> {SALES_PHONE.display}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadsUrl("2026/02/005-scaled.jpg")}
                alt="Raj & Raj steel furniture in a modern workspace"
                className="h-[360px] w-full object-cover sm:h-[420px]"
              />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-black/5 bg-black/5 shadow-xl sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white px-3 py-3 text-center">
                  <div className="text-lg font-bold text-[color:var(--ink)]">{stat.value}</div>
                  <div className="text-[11px] leading-tight text-[color:var(--muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 pt-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
              Who we work with
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--ink)] md:text-4xl">
              Furnishing workplaces across industries
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map(({ Icon, title, text }, index) => (
              <FadeIn key={title} delay={index * 0.04}>
                <div className="group h-full rounded-xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--brand)]/10 text-[color:var(--brand)] transition group-hover:bg-[color:var(--brand)] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[color:var(--ink)]">{title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Raj & Raj */}
      <section className="border-y border-black/5 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
              Why Raj &amp; Raj
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--ink)] md:text-4xl">
              A procurement partner, not just a supplier
            </h2>
          </FadeIn>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ Icon, title, text }, index) => (
              <FadeIn key={title} delay={index * 0.05} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--brand)] shadow-sm ring-1 ring-black/5">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[color:var(--ink)]">{title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--ink)] md:text-4xl">
              From enquiry to installation
            </h2>
          </FadeIn>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map(({ Icon, title, text }, index) => (
              <FadeIn key={title} delay={index * 0.08}>
                <li className="relative h-full rounded-xl border border-black/5 bg-white p-5 shadow-sm">
                  <span className="absolute right-4 top-4 text-3xl font-bold text-black/5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-6 w-6 text-[color:var(--brand)]" />
                  <h3 className="mt-4 font-semibold text-[color:var(--ink)]">{title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{text}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquiry" className="scroll-mt-28 bg-slate-50 py-20 border-t border-black/5">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
              Talk to sales
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--ink)] md:text-4xl">
              Request a business quote
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[color:var(--muted)]">
              Share your requirement and our B2B team will get back to you
              with recommendations and pricing.
            </p>
            <div className="mt-8 space-y-4">
              <a
                href={SALES_PHONE.href}
                className="flex items-center gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs text-[color:var(--muted)]">Call us (Mon–Sat, 10am–7pm)</span>
                  <span className="block font-semibold text-[color:var(--ink)]">{SALES_PHONE.display}</span>
                </span>
              </a>
              <a
                href={`mailto:${SALES_EMAIL}`}
                className="flex items-center gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs text-[color:var(--muted)]">Email the sales team</span>
                  <span className="block font-semibold text-[color:var(--ink)]">{SALES_EMAIL}</span>
                </span>
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl border border-black/5 bg-white p-6 shadow-xl sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[color:var(--brand)] to-red-400" />
            {loaded ? (
              <WpForm formKey="business" form={loaded.form} />
            ) : (
              <div className="py-10 text-center">
                <h3 className="text-lg font-semibold text-[color:var(--ink)]">
                  Our enquiry form is temporarily unavailable
                </h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Please call{" "}
                  <a href={SALES_PHONE.href} className="font-semibold text-[color:var(--brand)]">
                    {SALES_PHONE.display}
                  </a>{" "}
                  or email{" "}
                  <a href={`mailto:${SALES_EMAIL}`} className="font-semibold text-[color:var(--brand)]">
                    {SALES_EMAIL}
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
