import "@shopify/polaris/build/esm/styles.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f6f6f7]">{children}</div>;
}
