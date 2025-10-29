export const activities = [
  { title: "Α' ΦΑΣΗ", slug: "a-phase" },
  { title: "UFBB", slug: "ufbb" },
  { title: "FTTH", slug: "ftth" },
  { title: "NOVA", slug: "nova" },
  { title: "VODAFONE", slug: "vodafone" },
  { title: "CONSOLIDATION", slug: "consolidation" },
  { title: "METRO EFRENET", slug: "metro-efrenet" },
  { title: "GAS-TERCOM", slug: "gas-tercom" },
  { title: "FIBER GRID", slug: "fiber-grid" },
  { title: "UNITED FIBER", slug: "united-fiber" },
  { title: "TAP", slug: "tap" },
];

export function getActivityBySlug(slug: string) {
  return activities.find(a => a.slug === slug);
}
