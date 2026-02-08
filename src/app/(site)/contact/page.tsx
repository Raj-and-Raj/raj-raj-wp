import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Contact"
        title="Let’s shape your next space"
        description="Tell us about your project, timeline, and scale. We’ll reply within 48 hours."
      />
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="rounded-[32px] border border-black/5 bg-white/90 p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-[color:var(--muted)]">
              Name
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
                placeholder="Your name"
              />
            </label>
            <label className="text-sm text-[color:var(--muted)]">
              Email
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
                placeholder="you@email.com"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm text-[color:var(--muted)]">
            Project details
            <textarea
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              rows={5}
              placeholder="Tell us about your space and goals"
            />
          </label>
          <Button className="mt-6">Send request</Button>
        </form>
        <div className="rounded-[32px] border border-black/5 bg-white/80 p-8 text-sm text-[color:var(--muted)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">
            Studio info
          </p>
          <p className="mt-4 text-base text-[color:var(--ink)]">
            Raj & Raj Experience Studio
          </p>
          <p className="mt-2">Open by appointment only</p>
          <p className="mt-6">+91 98XXXXXXX</p>
          <p>hello@rajandraj.co</p>
          <p className="mt-6">Secure checkout via Razorpay</p>
        </div>
      </div>
    </div>
  );
}
