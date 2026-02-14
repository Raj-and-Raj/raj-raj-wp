"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- Types ---
interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  highlight?: boolean;
}

// --- Data ---
const STORES: Store[] = [
  {
    id: "1",
    name: "Raj & Raj Flagship",
    address: "25 Black Burn Lane, Tiretti",
    city: "Kolkata",
    state: "West Bengal",
    phone: "+91 33 4800 0018",
    email: "kolkata@rajandraj.co",
    lat: 22.5726,
    lng: 88.3639,
    highlight: true,
  },
  {
    id: "2",
    name: "Raj & Raj Experience Center",
    address: "DLF Cyber City, Phase 2",
    city: "Gurugram",
    state: "Haryana",
    phone: "+91 11 4567 8901",
    email: "delhi@rajandraj.co",
    lat: 28.4595,
    lng: 77.0266,
  },
  {
    id: "3",
    name: "Raj & Raj Studio",
    address: "Indiranagar, 100ft Road",
    city: "Bengaluru",
    state: "Karnataka",
    phone: "+91 80 1234 5678",
    email: "bangalore@rajandraj.co",
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: "4",
    name: "Raj & Raj West",
    address: "Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91 22 9876 5432",
    email: "mumbai@rajandraj.co",
    lat: 19.0760,
    lng: 72.8777,
  },
  {
    id: "5",
    name: "Raj & Raj South",
    address: "Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    phone: "+91 40 5555 6666",
    email: "hyderabad@rajandraj.co",
    lat: 17.3850,
    lng: 78.4867,
  },
];

// --- Map Constants (Calibrated for a standard India SVG) ---
// These bounds work well for a standard rectangular projection of India
const INDIA_BOUNDS = {
  minLat: 8.0, 
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5,
};

function getMapCoordinates(lat: number, lng: number) {
  // Simple linear interpolation for equirectangular projection
  // x = (lng - minLng) / (maxLng - minLng) * 100
  // y = (maxLat - lat) / (maxLat - minLat) * 100 (Inverted Y axis)
  
  const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * 100;
  const y = ((INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * 100;
  
  return { x, y };
}

export default function StoresPage() {
  const [activeStoreId, setActiveStoreId] = useState<string>(STORES[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = STORES.filter(store => 
    store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStore = STORES.find(s => s.id === activeStoreId) || STORES[0];

  const [zoom, setZoom] = useState(1);
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));

  return (
    <div className="min-h-screen bg-white">

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
                Visit our showrooms
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-[color:var(--ink)] sm:text-6xl mb-6">
                 Find a Store Near You.
              </h1>
              <p className="text-xl text-[color:var(--muted)] max-w-2xl mx-auto leading-relaxed">
                 Experience our craftsmanship firsthand. Visit one of our showrooms across India to see our latest collections and consult with our design experts.
              </p>
            </motion.div>
         </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-12">
          
          {/* Sidebar / List */}
          <div className="flex h-[600px] flex-col rounded-2xl border border-black/5 bg-white shadow-lg overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by city or state..." 
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[color:var(--brand)] focus:ring-1 focus:ring-[color:var(--brand)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredStores.map((store) => (
                <div 
                  key={store.id}
                  onClick={() => setActiveStoreId(store.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md",
                    activeStoreId === store.id 
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 ring-1 ring-[color:var(--brand)]" 
                      : "border-gray-100 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{store.city}, {store.state}</p>
                    </div>
                    {activeStoreId === store.id && (
                      <span className="flex h-2 w-2 rounded-full bg-[color:var(--brand)]"></span>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="line-clamp-1">{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                       <span>{store.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredStores.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No stores found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Map Area */}
          <div className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-black/5 bg-slate-50 shadow-inner group">
            {/* Map Texture/Background */}
            <div className="absolute inset-0 bg-[#eef2f6]">
               {/* Grid Pattern */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
              <button 
                onClick={handleZoomIn}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                disabled={zoom >= 3}
                aria-label="Zoom In"
              >
                <span className="text-xl font-bold">+</span>
              </button>
              <button 
                onClick={handleZoomOut}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                disabled={zoom <= 1}
                aria-label="Zoom Out"
              >
                <span className="text-xl font-bold">-</span>
              </button>
            </div>

            {/* The Map Container */}
            <div className="absolute inset-4 md:inset-10 flex items-center justify-center overflow-hidden">
              <motion.div 
                className="relative w-full h-full max-w-[500px] aspect-[0.85]"
                animate={{ scale: zoom }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* SVG Map of India (Placeholder) */}
                <Image
                   src="https://placehold.co/600x800/eee/31343C.png?text=India+Map+Placeholder"
                   alt="Map of India"
                   fill
                   className="object-contain opacity-40 hue-rotate-180 invert" 
                   priority
                />
                
                {/* Interactive Pins */}
                {STORES.map((store) => {
                  const { x, y } = getMapCoordinates(store.lat, store.lng);
                  const isActive = activeStoreId === store.id;

                  return (
                    <motion.div
                      key={store.id}
                      className="absolute group z-10 cursor-pointer"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      initial={false}
                      animate={{ scale: isActive ? 1.2 : 1, zIndex: isActive ? 20 : 10 }}
                      onClick={() => setActiveStoreId(store.id)}
                    >
                      {/* Pulse Effect */}
                      <span className={cn(
                        "absolute -inset-2 rounded-full opacity-75 animate-ping",
                        isActive ? "bg-[color:var(--brand)]" : "bg-gray-400 hidden group-hover:block"
                      )}></span>
                      
                      {/* Pin Icon */}
                      <div className={cn(
                        "relative flex h-8 w-8 -translate-x-1/2 -translate-y-full items-center justify-center transition-transform hover:-translate-y-[110%]",
                        isActive ? "text-[color:var(--brand)]" : "text-gray-600 hover:text-[color:var(--brand)]"
                      )}>
                        <MapPin className={cn("h-full w-full fill-current", isActive ? "drop-shadow-lg" : "drop-shadow-md")} />
                        
                        {/* Tooltip on Hover or Active */}
                        {(isActive) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-xl"
                          >
                            {store.city}
                            <div className="absolute bottom-0 left-1/2 -mb-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

              </motion.div>
            </div>

            {/* Active Store Details Overlay (Mobile/Floating) */}
            <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80">
               <motion.div 
                 key={activeStore.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="rounded-xl border border-black/5 bg-white/90 p-5 shadow-2xl backdrop-blur-md"
               >
                  <h3 className="text-lg font-bold text-gray-900">{activeStore.name}</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-start gap-3">
                       <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand)]" />
                       <p className="text-gray-600">{activeStore.address}, {activeStore.city} - {activeStore.state}</p>
                    </div>
                     <div className="flex items-center gap-3">
                       <Phone className="h-4 w-4 shrink-0 text-[color:var(--brand)]" />
                       <p className="font-medium text-gray-900">{activeStore.phone}</p>
                    </div>
                     <div className="flex items-center gap-3">
                       <Clock className="h-4 w-4 shrink-0 text-[color:var(--brand)]" />
                       <p className="text-gray-600">10:00 AM - 08:00 PM</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.98]">
                     Get Directions
                  </button>
               </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
