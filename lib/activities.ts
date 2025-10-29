export type Activity = { title: string; slug: string; description?: string };

export const ACTIVITIES: Activity[] = [
  { title: "Α΄ ΦΑΣΗ", slug: "phase-a" },
  { title: "FTTH", slug: "ftth" },
  { title: "CONCOLIDATION", slug: "concolidation" },
  { title: "METRO EFERNET", slug: "metro-efernet" },
  { title: "UFBB", slug: "ufbb", description: "Ultra-Fast Broadband" },
  { title: "NOVA", slug: "nova" },
  { title: "VODAFONE", slug: "vodafone" },
  { title: "GAS-TERCOM", slug: "gas-tercom" },
  { title: "FIBER GRID", slug: "fiber-grid" },
  { title: "UNITED FIBER", slug: "united-fiber" },
  { title: "TAP", slug: "tap" }
];
