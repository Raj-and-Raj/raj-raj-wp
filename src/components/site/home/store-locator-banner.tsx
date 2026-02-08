import { MapPin } from "lucide-react";

export function StoreLocatorBanner() {
  return (
    <div className="relative left-1/2 mb-20 h-[500px] w-screen -translate-x-1/2">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2670&auto=format&fit=crop"
          alt="Store interior"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4">
        <div className="max-w-2xl rounded-lg border border-white/10 bg-black/60 p-8 text-center text-white backdrop-blur-sm md:p-12">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Find a store near you
          </h2>
          <p className="mb-8 text-base leading-relaxed opacity-90 md:text-lg">
            Our stores give you the chance to experience our collection up
            close, as well as interact with our expert team. Come visit us
            soon.
          </p>
          <button className="inline-flex items-center gap-2 rounded bg-[#e46b5d] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#d15b4d]">
            Find a store near you <MapPin className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
