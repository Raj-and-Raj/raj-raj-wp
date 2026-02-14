import Link from "next/link";
import { uploadsUrl } from "@/lib/uploads";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10 text-slate-600">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
               <img
                  src={uploadsUrl("2026/01/cropped-Logo3.png")}
                  alt="Raj & Raj"
                  className="h-10 w-auto object-contain mix-blend-multiply"
                />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Crafting premium steel storage solutions for modern homes and businesses. Quality, durability, and style in every piece.
            </p>
            <div className="flex items-start gap-3 text-sm text-slate-500">
               <MapPin className="w-5 h-5 text-[color:var(--brand)] shrink-0 mt-0.5" />
               <span className="leading-relaxed">
                 Headquartered in Kolkata, West Bengal.<br />
                 Serving across WB & Jharkhand.
               </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-wide">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>
                <Link href="/about" className="hover:text-[color:var(--brand)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[color:var(--brand)] transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-[color:var(--brand)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[color:var(--brand)] transition-colors"></span>
                  Our Stores
                </Link>
              </li>
              <li>
                <Link href="/franchise" className="hover:text-[color:var(--brand)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[color:var(--brand)] transition-colors"></span>
                  Franchise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[color:var(--brand)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[color:var(--brand)] transition-colors"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-wide">Support & Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>
                <Link href="/privacy-policy" className="hover:text-[color:var(--brand)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[color:var(--brand)] transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-[color:var(--brand)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[color:var(--brand)] transition-colors"></span>
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-condition" className="hover:text-[color:var(--brand)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[color:var(--brand)] transition-colors"></span>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-wide">Get in Touch</h4>
            <div className="mb-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Support 24/7</p>
               <a href="tel:+913348000018" className="text-xl font-bold text-[color:var(--brand)] hover:opacity-80 transition-opacity block">
                 +91 33 4800 0018
               </a>
            </div>
            
            <div className="flex gap-2">
               {[
                 { Icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]" },
                 { Icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F]" },
                 { Icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]" },
                 { Icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]" },
                 { Icon: Youtube, href: "#", label: "Youtube", color: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]" }
               ].map((social, idx) => (
                 <a
                   key={idx}
                   href={social.href}
                   aria-label={social.label}
                   className={`w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 transition-all duration-300 shadow-sm ${social.color}`}
                 >
                   <social.Icon className="w-4 h-4" />
                 </a>
               ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500 text-center md:text-left">
            &copy; {currentYear} Raj & Raj. All Rights Reserved.
          </p>
          
          {/* Payment Methods */}
          <div className="flex items-center gap-3">
             <div className="h-7 px-2.5 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wide shadow-sm">VISA</div>
             <div className="h-7 px-2.5 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wide shadow-sm">MASTERCARD</div>
             <div className="h-7 px-2.5 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wide shadow-sm">UPI</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

