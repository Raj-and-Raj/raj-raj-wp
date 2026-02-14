"use client";

import { motion } from "framer-motion";
import { Award, Briefcase, ChevronRight, Clock, Globe, Heart, PenTool, ShieldCheck, Trophy, Users, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 }
};

export default function AboutPage() {
  return (
    <div className="bg-white w-full p-0">
      <section className="relative h-[55vh] pt-20 min-h-[450px] w-full overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" 
            alt="Modern Corporate Office"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        
        <div className="container relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 pt-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--brand)] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--brand)]"></span>
              </span>
              Since 1968
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-[1.1]">
              Engineered for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--brand)] to-rose-400">
                Endurance & Style
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-300 leading-relaxed">
              Raj & Raj has been the premier name in steel furniture manufacturing for over five decades. 
              We blend industrial precision with corporate elegance to define modern workspaces.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="border-y border-black/5 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
            {[
              { label: "Years of Excellence", value: "56+" },
              { label: "Projects Completed", value: "10k+" },
              { label: "Corporate Clients", value: "500+" },
              { label: "Cities Covered", value: "25+" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center border-r border-black/5 last:border-0 md:items-start md:pl-8 first:pl-0">
                <span className="text-2xl font-bold text-[color:var(--ink)] sm:text-3xl">{stat.value}</span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-[color:var(--brand)] mb-2">Our Legacy</h2>
              <h3 className="text-3xl font-bold text-[color:var(--ink)] sm:text-3xl mb-5">
                From a small workshop to <br/> West Bengal's industry leader.
              </h3>
              <div className="space-y-4 text-base text-[color:var(--muted)] leading-relaxed">
                <p>
                  Founded by Late Mr. Jagdish Prasad Gupta in 1968, Raj & Raj began with a simple mission: to build furniture that lasts a lifetime. 
                  What started as a modest manufacturing unit in Kolkata has transformed into a state-of-the-art facility serving the biggest names in the corporate world.
                </p>
                <p>
                  Today, we don't just manufacture furniture; we engineer productivity. Our rigorous quality control and commitment to ergonomic design 
                  have made us the preferred partner for organizations like the Airport Authority of India, SBI, and Aditya Birla Group.
                </p>
              </div>
              
              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-[color:var(--ink)]">ISO 9001:2015 Certified</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-2.5">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-sm text-[color:var(--ink)]">Pan-India Delivery</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-xl"
            >
              <Image 
                src="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=2187&auto=format&fit=crop" 
                alt="Furniture Factory Craftsmanship"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-medium text-sm">Precision Engineering & Craftsmanship</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. LEADERSHIP / TEAM SECTION - Modern & Polished */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-12 md:text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[color:var(--ink)] sm:text-3xl">Meet the Leadership</h2>
            <p className="mt-3 text-base text-[color:var(--muted)]">
              The visionaries driving innovation and excellence at Raj & Raj.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              {
                name: "Rahul Gupta",
                role: "Managing Director",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop",
                bio: "Leading Raj & Raj with 20+ years of expertise in industrial manufacturing and design."
              },
              {
                name: "Priya Sharma",
                role: "Head of Design",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
                bio: "An award-winning architect obsessed with ergonomic perfection and modern aesthetics."
              },
              {
                name: "Amit Malhotra",
                role: "Operations Head",
                image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop",
                bio: "Ensuring seamless production and delivery across our supply chain network."
              },
              {
                name: "Vikram Singh",
                role: "Chief Technology Officer",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
                bio: "Driving digital transformation and smart manufacturing processes."
              },
              {
                name: "Anjali Desai",
                role: "Marketing Director",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
                bio: "Crafting the brand narrative and connecting with clients globally."
              }
            ].map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative h-[380px] w-full max-w-[300px] overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <Image 
                  src={member.image} 
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                  <div className="mb-1 h-0.5 w-10 bg-[color:var(--brand)] transition-all duration-500 group-hover:w-full" />
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-xs font-medium text-slate-300 mb-3">{member.role}</p>
                  <p className="text-xs text-slate-200 opacity-0 transition-all duration-500 delay-100 group-hover:opacity-100 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VALUES - Corporate Grid */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="pr-8">
               <h2 className="text-2xl font-bold text-[color:var(--ink)] sm:text-3xl mb-5">Built on Unshakeable Values</h2>
               <p className="text-base text-[color:var(--muted)] leading-relaxed mb-6">
                 In an industry full of shortcuts, we choose the long road of quality and integrity. 
                 These core principles guide every piece of furniture that leaves our factory floor.
               </p>
               {/* <ButtonLink href="/contact" variant="outline" className="gap-2">
                 Work with us <ChevronRight className="h-4 w-4" />
               </ButtonLink> */}
            </div>
            
            <div className="grid gap-5 sm:grid-cols-2">
               {[
                 { icon: Clock, title: "Timely Delivery", desc: "We respect timelines as much as we respect quality." },
                 { icon: Trophy, title: "Unmatched Quality", desc: "Rigorous testing ensures durability for decades." },
                 { icon:  Users, title: "Customer Focus", desc: "Solutions tailored to your specific business needs." },
                 { icon: Heart, title: "Sustainable Practices", desc: "Eco-friendly materials and responsible manufacturing." },
               ].map((val, i) => (
                 <div key={i} className="rounded-lg border border-black/5 bg-white p-5 shadow-sm hover:border-[color:var(--brand)]/30 transition-colors">
                    <val.icon className="h-6 w-6 text-[color:var(--brand)] mb-3" />
                    <h4 className="font-bold text-[color:var(--ink)] text-sm">{val.title}</h4>
                    <p className="mt-1.5 text-xs text-[color:var(--muted)] leading-relaxed">{val.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

