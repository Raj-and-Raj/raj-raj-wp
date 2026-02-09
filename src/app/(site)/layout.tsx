import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-[color:var(--brand)] opacity-[0.08] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/3 rounded-full bg-[#fff] opacity-[0.7] blur-3xl"
      /> */}
      <SiteHeader />
      <main className="mx-auto w-full px-4 pb-24 md:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
