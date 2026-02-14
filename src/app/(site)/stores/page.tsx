"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    L?: any;
  }
}

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
    lat: 19.076,
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
    lat: 17.385,
    lng: 78.4867,
  },
];

export default function StoresPage() {
  const [activeStoreId, setActiveStoreId] = useState<string>(STORES[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<Record<string, any>>({});

  const filteredStores = useMemo(
    () =>
      STORES.filter(
        (store) =>
          store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  const activeStore = STORES.find((s) => s.id === activeStoreId) || STORES[0];

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) return;

    const ensureLeaflet = () =>
      new Promise<void>((resolve) => {
        if (window.L) {
          resolve();
          return;
        }
        const existingScript = document.querySelector(
          'script[src*="unpkg.com/leaflet"]',
        );
        const existingCss = document.querySelector(
          'link[href*="unpkg.com/leaflet"]',
        );
        if (!existingCss) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    ensureLeaflet().then(() => {
      if (!window.L || !mapRef.current) return;
      const map = window.L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([22.9868, 87.855], 7);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      leafletMapRef.current = map;

      const redIcon = window.L.divIcon({
        className: "store-marker",
        html: '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#d32f2f;box-shadow:0 0 0 4px rgba(211,47,47,0.2);"></span>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const activeIcon = window.L.divIcon({
        className: "store-marker",
        html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#d32f2f;box-shadow:0 0 0 6px rgba(211,47,47,0.35);animation:pulse 1.6s ease-in-out infinite;"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      STORES.forEach((store) => {
        const marker = window.L.marker([store.lat, store.lng], {
          icon: store.id === activeStoreId ? activeIcon : redIcon,
        }).addTo(map);
        marker.on("click", () => setActiveStoreId(store.id));
        leafletMarkersRef.current[store.id] = marker;
      });
    });
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !window.L) return;
    const marker = leafletMarkersRef.current[activeStoreId];
    if (marker) {
      Object.entries(leafletMarkersRef.current).forEach(([id, item]) => {
        const isActive = id === activeStoreId;
        const icon = window.L.divIcon({
          className: "store-marker",
          html: isActive
            ? '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#d32f2f;box-shadow:0 0 0 6px rgba(211,47,47,0.35);animation:pulse 1.6s ease-in-out infinite;"></span>'
            : '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#d32f2f;box-shadow:0 0 0 4px rgba(211,47,47,0.2);"></span>',
          iconSize: isActive ? [16, 16] : [12, 12],
          iconAnchor: isActive ? [8, 8] : [6, 6],
        });
        item.setIcon(icon);
      });
      leafletMapRef.current.setView(marker.getLatLng(), 12);
    }
  }, [activeStoreId]);

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
              Experience our craftsmanship firsthand. Visit one of our showrooms
              across India to see our latest collections and consult with our
              design experts.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <style jsx global>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            70% {
              transform: scale(1.15);
              opacity: 0.5;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
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
                      : "border-gray-100 bg-white hover:border-gray-300",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {store.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {store.city}, {store.state}
                      </p>
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
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--brand)]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Get directions
                    </a>
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
            {/* Map */}
            <div className="absolute inset-2 md:inset-4 overflow-hidden rounded-xl">
              <div ref={mapRef} className="h-full w-full" />
            </div>

            {/* Active Store Details Overlay (Mobile/Floating) */}
            {/* <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80">
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
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeStore.lat},${activeStore.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.98]"
                  >
                     Get Directions
                  </a>
               </motion.div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
