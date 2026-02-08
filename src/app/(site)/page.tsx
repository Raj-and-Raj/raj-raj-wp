import { HeroSlider } from "@/components/site/home/hero-slider";
import { FeaturedBrands } from "@/components/site/home/featured-brands";
import { PopularCategories } from "@/components/site/home/popular-categories";
import { ShopByCollection } from "@/components/site/home/shop-by-collection";
import { ExchangeBanner } from "@/components/site/home/exchange-banner";
import { StatsBanner } from "@/components/site/home/stats-banner";
import { StoreLocatorBanner } from "@/components/site/home/store-locator-banner";
import { BusinessSolutionsBanner } from "@/components/site/home/business-solutions-banner";
import { GoogleReviews } from "@/components/site/home/google-reviews";
import { Newsletter } from "@/components/site/home/newsletter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSlider />
      <FeaturedBrands />
      <PopularCategories />
      <ShopByCollection />
      <ExchangeBanner />
      <StatsBanner />
      <StoreLocatorBanner />
      <BusinessSolutionsBanner />
      <GoogleReviews />
      {/* <Newsletter /> */}
    </div>
  );
}
