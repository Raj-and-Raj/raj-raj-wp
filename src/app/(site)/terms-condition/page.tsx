"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TermsConditionsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-slate-50 pt-32 pb-20 border-b border-black/5">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="container relative mx-auto max-w-5xl px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center rounded-full border border-black/5 bg-white px-3 py-1 text-sm font-medium text-[color:var(--brand)] shadow-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[color:var(--brand)] mr-2 animate-pulse"></span>
                Legal
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6">
                 Terms & Conditions
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                 Please read these terms and conditions carefully before using our website.
              </p>
            </motion.div>
         </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="space-y-12 text-lg text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
              <p className="mb-4">This website is operated by Raj & Raj. Throughout the site, the terms “we”, “us” and “our” refer to Raj & Raj. Raj & Raj offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
              <p className="mb-4">By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content.</p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">1. Online Store Terms</h2>
              <p className="mb-4">By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>
            </section>
            
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">2. General Conditions</h2>
              <p className="mb-4">We reserve the right to refuse service to anyone for any reason at any time.</p>
              <p className="mb-4">You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">3. Accuracy, Completeness and Timeliness of Information</h2>
              <p className="mb-4">We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.</p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">4. Modifications to the Service and Prices</h2>
              <p className="mb-4">Prices for our products are subject to change without notice.</p>
              <p className="mb-4">We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>
              <p className="mb-4">We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">5. Products or Services</h2>
              <p className="mb-4">Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.</p>
              <p className="mb-4">We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">6. Errors, Inaccuracies and Omissions</h2>
              <p className="mb-4">Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).</p>
            </section>

            <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">7. Contact Information</h2>
              <p className="mb-6">Questions about the Terms of Service should be sent to us at <a href="mailto:hello@rajandraj.co" className="text-[color:var(--brand)] font-medium hover:underline">hello@rajandraj.co</a>.</p>
              <div className="flex flex-col space-y-2 text-base font-medium text-slate-900">
                <span>Raj & Raj</span>
                <a href="mailto:hello@rajandraj.co" className="hover:text-[color:var(--brand)] transition-colors">hello@rajandraj.co</a>
                <span>+91 33 4800 0018</span>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
