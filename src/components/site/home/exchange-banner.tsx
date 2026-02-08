import Link from "next/link";

export function ExchangeBanner() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <div className="flex flex-col bg-[#fdf8f5] md:flex-row">
        <div className="relative h-[400px] w-full overflow-hidden md:h-auto md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1505693416388-b0346efee539?q=80&w=2670&auto=format&fit=crop"
            alt="Bedroom furniture"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex w-full flex-col items-start justify-center p-8 md:w-1/2 md:p-16">
          <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-800 md:text-4xl">
            Upgrade your space,
            <br />
            enjoy hassle free exchange.
          </h2>
          <p className="mb-8 font-medium text-gray-600">
            Exchange your old furniture and save up to{" "}
            <span className="font-bold text-black">INR 5000</span>
          </p>

          <Link
            href="/products"
            className="rounded border border-gray-300 bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 shadow-sm transition-all hover:border-transparent hover:bg-gray-800 hover:text-white"
          >
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
}
