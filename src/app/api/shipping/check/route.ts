import {
  fetchShippingZoneLocations,
  fetchShippingZones,
} from "@/lib/woocommerce";

function normalizePostcode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function matchesPostcode(input: string, rule: string) {
  const normalizedInput = normalizePostcode(input);
  const normalizedRule = normalizePostcode(rule);

  if (normalizedRule.includes("*")) {
    const pattern = new RegExp(
      "^" + normalizedRule.replace(/\*/g, ".*") + "$"
    );
    return pattern.test(normalizedInput);
  }

  if (normalizedRule.includes("...")) {
    const [start, end] = normalizedRule.split("...");
    if (start && end) {
      return normalizedInput >= start && normalizedInput <= end;
    }
  }

  return normalizedInput === normalizedRule;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode")?.trim() ?? "";

  if (!postcode) {
    return Response.json(
      { available: false, reason: "Missing postcode." },
      { status: 400 }
    );
  }

  const zones = await fetchShippingZones();
  for (const zone of zones) {
    const locations = await fetchShippingZoneLocations(zone.id);
    const postcodeRules = locations.filter((loc) => loc.type === "postcode");

    if (postcodeRules.length === 0) {
      return Response.json({ available: true, zone: zone.name });
    }

    if (postcodeRules.some((loc) => matchesPostcode(postcode, loc.code))) {
      return Response.json({ available: true, zone: zone.name });
    }
  }

  return Response.json({ available: false });
}
