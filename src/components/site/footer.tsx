import Link from "next/link";
import { uploadsUrl } from "@/lib/uploads";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white pb-8 pt-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16 flex flex-col justify-between gap-12 lg:flex-row">
          <div className="lg:w-1/3">
            <Link href="/" className="mb-6 inline-block">
              <div className="text-3xl font-bold italic tracking-tighter text-[#c4302b]">
                <img
                  src={uploadsUrl("2026/01/cropped-Logo3.png")}
                  alt="Raj and Raj logo featuring a red bull head icon with white horns, accompanied by bold red text reading RAJ AND RAJ and a tagline stating Your trusted choice, representing a trusted brand choice"
                  width="220"
                  height="60"
                />
              </div>
            </Link>
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
              At Raj & Raj, we manufacture high-quality steel storage furniture{" "}
              for commercial and residential use. Headquartered in Kolkata, West
              Bengal, we serve customers through a wide dealer network across
              West Bengal and Jharkhand.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <h4 className="mb-1 text-sm font-bold text-gray-900">
                  Got question? Call us 24/7
                </h4>
                <a
                  href="tel:+913348000018"
                  className="text-xl font-bold text-[#c4302b]"
                >
                  +91 33 4800 0018
                </a>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-bold text-gray-900">
                  Payment Method
                </h4>
                <div className="flex gap-2 opacity-80">
                  <div className="flex h-6 w-10 items-center justify-center rounded border border-blue-200 bg-blue-100 text-[8px] font-bold text-blue-800">
                    VISA
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded border border-red-200 bg-red-100 text-[8px] font-bold text-red-800">
                    Master
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded border border-blue-100 bg-blue-50 text-[8px] font-bold text-blue-600">
                    PayPal
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded border border-indigo-100 bg-indigo-50 text-[8px] font-bold text-indigo-600">
                    Amex
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12 md:flex-row lg:w-1/2 lg:justify-end">
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-wide text-gray-900">
                About Us
              </h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <Link
                    href="/about"
                    className="transition-colors hover:text-[#c4302b]"
                  >
                    About Raj & Raj
                  </Link>
                </li>
                <li>
                  <Link
                    href="/franchise"
                    className="transition-colors hover:text-[#c4302b]"
                  >
                    Franchise Enquiry
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stores"
                    className="transition-colors hover:text-[#c4302b]"
                  >
                    Our Stores
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-[#c4302b]"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-wide text-gray-900">
                Help
              </h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-[#c4302b]"
                  >
                    Terms & Condition
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-[#c4302b]"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="transition-colors hover:text-[#c4302b]"
                  >
                    Refund and Returns Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-xs text-gray-400 md:flex-row">
          <div className="text-center md:text-left">
            Copyright (c) 2021 Raj & Raj. All Rights Reserved.
            <span className="mx-2">|</span>
            <Link href="/terms" className="text-[#c4302b] hover:underline">
              Terms & Condition
            </Link>
            <span className="mx-2">|</span>
            <Link href="/privacy" className="text-[#c4302b] hover:underline">
              Privacy Policy
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-2">Social Media</span>
            <a
              href="#"
              className="p-2 text-gray-400 transition-colors hover:text-[#1877F2]"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="p-2 text-gray-400 transition-colors hover:text-[#1DA1F2]"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="p-2 text-gray-400 transition-colors hover:text-[#FF0000]"
              aria-label="Youtube"
            >
              <Youtube className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="p-2 text-gray-400 transition-colors hover:text-[#E4405F]"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="p-2 text-gray-400 transition-colors hover:text-[#0A66C2]"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
