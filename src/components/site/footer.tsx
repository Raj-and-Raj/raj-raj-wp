import Link from "next/link";
import { uploadsUrl } from "@/lib/uploads";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(135deg,#050505_0%,#0b0b0f_35%,#190306_70%,#050505_100%)] pt-16 pb-10 text-white">
      <div className="container relative mx-auto px-6">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--brand)]">
                  Business Solutions
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Enterprise-grade steel furniture for offices & institutions.
                </h3>
              </div>
              <Link
                href="/business"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white shadow-[0_0_18px_rgba(221,51,51,0.55)] hover:brightness-110"
              >
                Talk to sales <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white/50 uppercase">
                  Projects
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  10k+
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Corporate & public sector
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white/50 uppercase">
                  Coverage
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  2+ States
                </p>
                <p className="mt-1 text-xs text-white/60">
                  WB & Jharkhand
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white/50 uppercase">
                  Lead Time
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  7-14 Days
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Bulk-ready production
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2 p-4 text-white">
            <div>
              <h4 className="font-bold mb-6 text-lg tracking-wide text-white">
                Support & Legal
              </h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/return-policy"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-condition"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:flex-2">
              <h4 className="font-bold mb-6 text-lg tracking-wide text-white">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stores"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    Our Stores
                  </Link>
                </li>
                <li>
                  <Link
                    href="/franchise"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    Franchise
                  </Link>
                </li>
                <li>
                  <Link
                    href="/business"
                    className="hover:text-[color:var(--brand)] transition-colors"
                  >
                    B2B Procurement
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2">
          <div className="space-y-6 justify-content-center md:mt-10 text-white">
            <Link href="/" className="inline-block">
              <img
                src={uploadsUrl("2026/01/cropped-Logo3.png")}
                alt="Raj & Raj"
                className="h-10 w-auto object-contain mix-blend-lighten"
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Trusted manufacturer of premium steel storage solutions for
              enterprises, institutions, and modern homes.
            </p>
            <div className="flex items-start gap-3 text-sm text-white/70">
              <MapPin className="w-5 h-5 text-[color:var(--brand)] shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(221,51,51,0.7)]" />
              <span className="leading-relaxed">
                Headquartered in Kolkata, West Bengal.
                <br />
                Serving across WB and Jharkhand.
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-[color:var(--brand)]/30 p-6 bg-[linear-gradient(145deg,#120205,#050505)] text-white md:p-8">
            <h3 className="text-xl font-semibold">Get a corporate quote</h3>
            <p className="mt-2 text-sm text-white/70">
              Share your requirements and our team will respond within 24 hours.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <a
                href="mailto:sales@rajandraj.co"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
              >
                <Mail className="h-4 w-4 text-white/70" />
                sales@rajandraj.co
              </a>
              <a
                href="tel:+913348000018"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
              >
                <Phone className="h-4 w-4 text-white/70" />
                +91 33 4800 0018
              </a>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <MapPin className="mt-0.5 h-4 w-4 text-white/70" />
                <span className="text-white/70">
                  25 Black Burn Lane, Kolkata
                  <br />
                  West Bengal, 700012
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-white/60 text-center md:text-left">
            &copy; {currentYear} Raj & Raj. All Rights Reserved.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              {
                Icon: Facebook,
                href: "#",
                label: "Facebook",
                color:
                  "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
              },
              {
                Icon: Instagram,
                href: "https://instagram.com",
                label: "Instagram",
                color:
                  "hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F]",
              },
              {
                Icon: Twitter,
                href: "#",
                label: "Twitter",
                color:
                  "hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]",
              },
              {
                Icon: Linkedin,
                href: "#",
                label: "LinkedIn",
                color:
                  "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
              },
              {
                Icon: Youtube,
                href: "#",
                label: "Youtube",
                color:
                  "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
              },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                aria-label={social.label}
                className={`w-10 h-10 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-white/70 transition-all duration-300 ${social.color}`}
              >
                <social.Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
