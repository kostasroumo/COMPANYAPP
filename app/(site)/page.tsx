import SectionGrid from "@/components/SectionGrid";
import ActivityCard from "@/components/ActivityCard";

const activities = [
  { title: "Α' ΦΑΣΗ", slug: "a-phase" },
  { title: "UFBB", slug: "ufbb" },
  { title: "FTTH", slug: "ftth" },
  { title: "NOVA", slug: "nova" },
  { title: "VODAFONE", slug: "vodafone" },
  { title: "CONSOLIDATION", slug: "consolidation" },
  { title: "METRO EFRENET", slug: "metro-efrenet" },   // άλλαξέ το αν έχεις άλλο slug
  { title: "GAS-TERCOM", slug: "gas-tercom" },         // "
  { title: "FIBER GRID", slug: "fiber-grid" },
  { title: "UNITED FIBER", slug: "united-fiber" },
  { title: "TAP", slug: "tap" },
];

export default function Page() {
  return (
    <main style={{ padding: "24px" }}>
      <h1 className="section-title">Δραστηριότητες / Συμβάσεις</h1>
      <p className="subtle">Επιλέξτε ενότητα (βήματα, υλικά, φωτογραφίες).</p>

      <SectionGrid>
        {activities.map((a) => (
          <ActivityCard
            key={a.slug}
            title={a.title}
            actions={[
              { href: `/activities/${a.slug}`, label: "Άνοιγμα" },
              { href: `/activities/${a.slug}?newTab=1`, label: "Νέα καρτέλα", variant: "ghost" },
            ]}
          />
        ))}
      </SectionGrid>
    </main>
  );
}
