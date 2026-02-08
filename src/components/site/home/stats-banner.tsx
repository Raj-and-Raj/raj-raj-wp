export function StatsBanner() {
  return (
    <div className="relative left-1/2 mb-20 w-screen -translate-x-1/2 bg-[#e46b5d] py-16 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold md:text-4xl">
            Interio for India
          </h2>
          <p className="text-sm font-medium tracking-wide opacity-90 md:text-base">
            Providing comfort and style for modern living
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 divide-y divide-white/20 text-center md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="px-4 py-4 md:py-0">
            <div className="mb-2 text-5xl font-bold md:text-6xl">30+</div>
            <p className="text-sm font-medium opacity-90">
              Innovative products launched every year
            </p>
          </div>

          <div className="px-4 py-4 md:py-0">
            <div className="mb-2 text-5xl font-bold md:text-6xl">17,000+</div>
            <p className="text-sm font-medium opacity-90">
              Pin codes serviced
            </p>
          </div>

          <div className="px-4 py-4 md:py-0">
            <div className="mb-2 text-5xl font-bold md:text-6xl">1000+</div>
            <p className="text-sm font-medium opacity-90">
              Stores across the country
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
