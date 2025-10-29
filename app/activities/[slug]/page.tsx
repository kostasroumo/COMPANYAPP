import SectionGrid from "@/components/SectionGrid";
import ActivityCard from "@/components/ActivityCard";

export default function Page() {
  return (
    <main style={{ padding: "24px" }}>
      <h1 className="section-title">Δραστηριότητες / Συμβάσεις</h1>
      <p className="subtle">Επιλέξτε ενότητα (βήματα, υλικά, φωτογραφίες).</p>

      <SectionGrid>
        <ActivityCard
          title="Α' ΦΑΣΗ"
          actions={[
            { href: "/activities/a-phase", label: "Άνοιγμα" },
            { href: "/activities/a-phase?newTab=1", label: "Νέα καρτέλα", variant: "ghost" },
          ]}
        />
        <ActivityCard
          title="FTTH"
          actions={[
            { href: "/activities/ftth", label: "Άνοιγμα" },
            { href: "/activities/ftth?newTab=1", label: "Νέα καρτέλα", variant: "ghost" },
          ]}
        />
        {/* …βάλε όλα τα υπόλοιπα tiles (UFBB, NOVA, κ.λπ.) */}
      </SectionGrid>
    </main>
  );
}
