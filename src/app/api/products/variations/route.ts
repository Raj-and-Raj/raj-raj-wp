import { fetchProductById, fetchProductVariations } from "@/lib/woocommerce";

type VariationSwatch = { label: string; image?: string };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  if (!ids.length) {
    return Response.json({});
  }

  const result: Record<string, VariationSwatch[]> = {};

  await Promise.all(
    ids.map(async (id) => {
      try {
        const [product, variations] = await Promise.all([
          fetchProductById(id),
          fetchProductVariations(id),
        ]);

        if (!variations.length) {
          result[String(id)] = [];
          return;
        }

        const colorAttrName =
          product.attributes?.find((attr) => {
            const name = attr.name.toLowerCase();
            return name.includes("color") || name.includes("colour");
          })?.name || product.attributes?.[0]?.name;

        const swatches = variations
          .map((variation) => {
            const match = variation.attributes.find(
              (attr) => attr.name === colorAttrName
            );
            return {
              label: match?.option || "Variant",
              image: variation.image?.src,
            };
          })
          .filter((swatch) => swatch.image);

        result[String(id)] = swatches;
      } catch {
        result[String(id)] = [];
      }
    })
  );

  return Response.json(result);
}
