import SectionGrid from "@/components/SectionGrid";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0f14", color: "#e6edf3" }}>
      <header style={{ padding: "18px 24px", borderBottom: "1px solid #1f2937", background: "#111827", position: "sticky", top: 0 }}>
        <h1 style={{ margin: 0 }}>Δραστηριότητες / Συμβάσεις</h1>
        <div style={{ opacity: 0.8, fontSize: ".95rem" }}>
          Επιλέξτε ενότητα (βήματα, υλικά, φωτογραφίες).
        </div>
      </header>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        <SectionGrid />
      </div>
    </main>
  );
}
