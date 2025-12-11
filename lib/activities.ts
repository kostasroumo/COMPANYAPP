// lib/activities.ts

export type ActivityDef = {
  slug: string;
  title: string;
  hasTemplate?: boolean; // π.χ. UFBB σπέρνεται από /public/data/ufbb.json
};

export const activities: ActivityDef[] = [
  { slug: "a-phase",        title: "Α' ΦΑΣΗ" },
  { slug: "ufbb",           title: "UFBB", hasTemplate: true }, // <-- template
  { slug: "ftth",           title: "FTTH" },
  { slug: "nova",           title: "NOVA" },
  { slug: "vodafone",       title: "VODAFONE" },
  { slug: "consolidation",  title: "CONSOLIDATION" },
  { slug: "metro-efrenet",  title: "METRO EFRENET" },
  { slug: "gas-tercom",     title: "GAS-TERCOM" },
  { slug: "fiber-grid",     title: "FIBER GRID" },
  { slug: "united-fiber",   title: "UNITED FIBER" },
  { slug: "tap",            title: "TAP" },
];

export function getActivityBySlug(slug: string) {
  return activities.find(a => a.slug === slug);
}

// προαιρετικά aliases, αν τα χρειάζεσαι
export const ACTIVITIES = activities;
export const getActivity = getActivityBySlug;
