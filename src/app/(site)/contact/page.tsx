"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, MessageSquare, ArrowRight, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO HEADER */}
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
                We are here to help
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-[color:var(--ink)] sm:text-6xl mb-6">
                 Let's Start a Conversation.
              </h1>
              <p className="text-xl text-[color:var(--muted)] max-w-2xl mx-auto leading-relaxed">
                 Whether you have a question about our products, need a custom solution, or want to discuss a large project, our team is ready to assist you.
              </p>
            </motion.div>
         </div>
      </section>

      {/* 2. DIRECT CONTACT METHODS - Large Cards */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
             {/* Phone Card */}
             <motion.div variants={fadeInUp} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                   <Phone className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--ink)] mb-2">Phone Support</h3>
                <p className="text-[color:var(--muted)] mb-6">Call us directly Mon-Sat from 10am to 7pm.</p>
                <div className="space-y-1">
                  <a href="tel:+913348000018" className="block text-xl font-bold text-[color:var(--brand)] hover:underline">
                    +91 33 4800 0018
                  </a>
                  <p className="text-sm text-[color:var(--muted)]">Main Office</p>
                </div>
             </motion.div>

             {/* Email Card */}
             <motion.div variants={fadeInUp} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                   <Mail className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--ink)] mb-2">Email Us</h3>
                <p className="text-[color:var(--muted)] mb-6">Drop us a line anytime. We usually reply within 24 hours.</p>
                <div className="space-y-1">
                  <a href="mailto:hello@rajandraj.co" className="block text-xl font-bold text-[color:var(--brand)] hover:underline">
                    hello@rajandraj.co
                  </a>
                  <a href="mailto:support@rajandraj.co" className="block text-base font-medium text-[color:var(--muted)] hover:text-[color:var(--ink)]">
                    sales@rajandraj.co
                  </a>
                </div>
             </motion.div>
             
             {/* Chat/Social Card */}
             <motion.div variants={fadeInUp} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                   <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--ink)] mb-2">Live Chat</h3>
                <p className="text-[color:var(--muted)] mb-6">Chat with our support team on WhatsApp for quick queries.</p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-lg font-bold text-[color:var(--brand)] group-hover:underline"
                >
                  Start WhatsApp Chat <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. VISIT US SECTION - Map & Address */}
      <section className="bg-slate-50 py-24 border-t border-black/5">
         <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
               >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-bold text-[color:var(--ink)] sm:text-4xl mb-6">Visit Our Showroom</h2>
                  <p className="text-lg text-[color:var(--muted)] mb-8 leading-relaxed">
                    Experiencing our furniture in person is the best way to appreciate the craftsmanship. 
                    Visit our flagship store in Kolkata to see our complete collection.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="pl-4 border-l-2 border-[color:var(--brand)]">
                        <h4 className="text-lg font-bold text-[color:var(--ink)]">Raj & Raj HQ</h4>
                        <p className="text-[color:var(--muted)] mt-1">
                           25 Black Burn Lane, <br/>
                           Kolkata – 700012, West Bengal
                        </p>
                     </div>
                     
                     <div className="pl-4 border-l-2 border-slate-200">
                        <h4 className="text-lg font-bold text-[color:var(--ink)]">Opening Hours</h4>
                        <p className="text-[color:var(--muted)] mt-1">
                           Monday - Saturday: 10:00 AM - 07:00 PM<br/>
                           Sunday: Closed
                        </p>
                     </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                     <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-black/10 text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:border-[color:var(--brand)] transition-colors">
                        <Facebook className="h-5 w-5" />
                     </a>
                     <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-black/10 text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:border-[color:var(--brand)] transition-colors">
                        <Instagram className="h-5 w-5" />
                     </a>
                     <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-black/10 text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:border-[color:var(--brand)] transition-colors">
                        <Linkedin className="h-5 w-5" />
                     </a>
                     <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-black/10 text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:border-[color:var(--brand)] transition-colors">
                        <Twitter className="h-5 w-5" />
                     </a>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-xl bg-slate-200 border border-black/5"
               >
                  {/* Placeholder for an actual map embed or image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                     <iframe 
                       src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.076840474648!2d88.35858631541814!3d22.57624133852528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277b0f0b0b0b1%3A0x1b0b0b0b0b0b0b0b!2sKolkata%2C%20West%20Bengal%2C%20India!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" 
                       width="100%" 
                       height="100%" 
                       style={{ border: 0, filter: 'grayscale(100%) invert(0%) contrast(80%)' }} 
                       allowFullScreen 
                       loading="lazy"
                       className="opacity-80 hover:opacity-100 transition-opacity duration-500"
                     ></iframe>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>
    </div>
  );
}
