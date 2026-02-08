export function FeaturedBrands() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <div className="mb-10 text-center md:text-left">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Featured Brands
        </h2>
        <p className="text-sm text-gray-500">
          Working with the most recognized brands and manufacturers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative h-[400px] overflow-hidden bg-gray-50">
          <div className="absolute left-6 top-6 z-10">
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider">
              ARHAUSE
            </h3>
            <p className="text-xs text-gray-500">Modern dining chairs</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex h-[300px] items-end justify-center">
            <img
              src="https://plus.unsplash.com/premium_photo-1681046751108-a516910544f1?q=80&w=2670&auto=format&fit=crop"
              alt="Arhause"
              className="h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="group relative flex h-[400px] flex-col justify-between overflow-hidden bg-[#f8f8f6] p-6">
          <div>
            <h3 className="text-lg text-gray-900">Josepe Casa</h3>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div className="relative z-10 w-1/2">
              <h4 className="text-2xl leading-tight text-gray-800 md:text-3xl">
                SCANDINAVIAN <br />
                FURNITURE WITH A <br />
                MINIMALISTIC <br />
                DESIGN
              </h4>
            </div>
            <div className="flex h-full w-1/2 items-end justify-end">
              <img
                src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2670&auto=format&fit=crop"
                alt="Josepe Casa"
                className="w-full object-contain transition-transform duration-500 group-hover:rotate-6"
              />
            </div>
          </div>
        </div>

        <div className="group relative h-[400px] overflow-hidden bg-gray-50">
          <div className="absolute left-6 top-6 z-10">
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider">
              LA CASA MIA
            </h3>
            <p className="text-xs text-gray-500">
              Home accessories with Danish design
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex h-[250px] items-end justify-center">
            <img
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop"
              alt="La Casa Mia"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
