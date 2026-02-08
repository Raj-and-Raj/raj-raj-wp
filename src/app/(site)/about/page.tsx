import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="About"
        title="A studio obsessed with modern calm"
        description="We design interiors and furniture for people who want quiet confidence in their space."
      />
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-black/5 bg-white/90 p-8 text-[color:var(--muted)]">
          <p>
            Raj & Raj blends clean geometry with artisanal materiality. Our
            studio collaborates with craftspeople across India to produce
            modern pieces built for longevity. We believe minimalism should
            feel warm, tactile, and lived-in.
          </p>
          <p className="mt-5">
            Every product is refined for durability, comfort, and effortless
            styling. From lounge seating to statement lighting, we help you
            shape modern interiors that stay relevant for years.
          </p>
        </div>
        <div className="rounded-[32px] border border-black/5 bg-[linear-gradient(160deg,_rgba(221,51,51,0.18),_rgba(255,255,255,0.7))] p-8">
          <p className="text-sm font-semibold text-[color:var(--brand)]">
            Our process
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <li>Concept sketching and mood boarding</li>
            <li>Material sourcing with artisan partners</li>
            <li>Prototype testing for comfort and durability</li>
            <li>Final production with white-glove delivery</li>
          </ul>
          <ButtonLink href="/contact" className="mt-6">
            Book a consultation
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
