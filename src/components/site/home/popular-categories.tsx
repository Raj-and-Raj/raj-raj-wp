import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CategoryCardProps = {
  subtitle: string;
  title: string;
  image: string;
  bgColor: string;
  colSpan?: string;
  textColor?: string;
  showButton?: boolean;
};

function CategoryCard({
  subtitle,
  title,
  image,
  bgColor,
  colSpan = "col-span-1",
  textColor = "text-gray-900",
  showButton = false,
}: CategoryCardProps) {
  return (
    <div
      className={`${bgColor} ${colSpan} group relative min-h-[300px] overflow-hidden rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1`}
    >
      <div className="relative z-10 flex h-full flex-col items-start">
        <span className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
          {subtitle}
        </span>
        <h3 className={`mb-6 text-4xl font-extrabold uppercase ${textColor}`}>
          {title}
        </h3>

        {showButton ? (
          <Link
            href="/products"
            className="mt-auto inline-flex items-center gap-2 rounded bg-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
          >
            Shop Now <ArrowRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>

      <div className="absolute bottom-0 right-0 top-0 w-2/3 transition-transform duration-500 group-hover:scale-105">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-contain object-bottom drop-shadow-xl md:object-center"
        />
      </div>
    </div>
  );
}

export function PopularCategories() {
  return (
    <div className="container mx-auto mb-20 px-4 md:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Product Categories
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <CategoryCard
          subtitle="Home & Living"
          title="Sofa"
          image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
          bgColor="bg-gray-100"
          colSpan="md:col-span-2"
          showButton
        />
        <CategoryCard
          subtitle="Office & Study"
          title="Chairs"
          image="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1974&auto=format&fit=crop"
          bgColor="bg-blue-50"
          textColor="text-slate-700"
        />
        <CategoryCard
          subtitle="Kids & Storage"
          title="Cabinets"
          image="https://images.unsplash.com/photo-1595515106968-30c1e457f722?q=80&w=2670&auto=format&fit=crop"
          bgColor="bg-yellow-50"
          textColor="text-yellow-800"
        />
        <CategoryCard
          subtitle="Decor & Art"
          title="Frames"
          image="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
          bgColor="bg-[#F2E9E4]"
          textColor="text-stone-700"
        />
        <CategoryCard
          subtitle="Accessories"
          title="Lamps"
          image="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1974&auto=format&fit=crop"
          bgColor="bg-green-50"
          textColor="text-emerald-800"
        />
        <CategoryCard
          subtitle="Bedroom Luxury"
          title="Beds"
          image="https://images.unsplash.com/photo-1505693416388-b0346efee539?q=80&w=2670&auto=format&fit=crop"
          bgColor="bg-red-50"
          colSpan="md:col-span-2"
          textColor="text-rose-900"
          showButton
        />
      </div>
    </div>
  );
}
