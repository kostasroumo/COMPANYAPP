import fs from "node:fs";
import path from "node:path";
import { ACTIVITIES } from "@/lib/activities";

type UFBB = {
  name: string;
  tasks: {
    id: number;
    title: string;
    type?: string | null;
    steps: { text: string; comment?: string | null }[];
    materials: string[];
    comments: string[];
  }[];
};

const th: React.CSSProperties = { textAlign: "left", border: "1px solid #1f2937", padding: 8, background: "#0b1220" };
const td: React.CSSProperties = { border: "1px solid #1f2937", padding: 8, verticalAlign: "top" };

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const activity = ACTIVITIES.find(a => a.slug === params.slug);
  if (!activity) return <div style={{ padding: 24 }}>Not found</div>;

  if (params.slug === "ufbb") {
    const p = path.join(process.cwd(), "public", "data", "ufbb.json");
    const ufbb: UFBB = JSON.parse(fs.readFileSync(p, "utf-8"));

    return (
      <main style={{ background: "#0b0f14", minHeight: "100vh", color: "#e6edf3" }}>
        <header style={{ padding: "18px 24px", borderBottom: "1px solid #1f2937", background: "#111827" }}>
          <h1 style={{ margin: 0 }}>{ufbb.name} – Εργασίες</h1>
          <div style={{ opacity: .8 }}>Βήματα • Υλικά • Σχόλια</div>
        </header>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
          {ufbb.tasks.map(t => (
            <details key={t.id} style={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 14, padding: "14px 18px", marginBottom: 14 }}>
              <summary style={{ fontWeight: 700, cursor: "pointer" }}>{t.id}. {t.title}{t.type ? ` — ${t.type}` : ""}</summary>
              <div style={{ marginTop: 10, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Βήματα</th>
                      <th style={th}>Υλικά</th>
                      <th style={th}>Σχόλια</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.max(t.steps.length, t.materials.length, t.comments.length, 1) }).map((_, i) => {
                      const step = t.steps[i]?.text ?? "";
                      const mat  = t.materials[i] ?? "";
                      const comm = t.comments[i] ?? t.steps[i]?.comment ?? "";
                      return (
                        <tr key={i}>
                          <td style={td}>{step}</td>
                          <td style={td}>{mat}</td>
                          <td style={td}>{comm}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#0b0f14", minHeight: "100vh", color: "#e6edf3" }}>
      <header style={{ padding: "18px 24px", borderBottom: "1px solid #1f2937", background: "#111827" }}>
        <h1 style={{ margin: 0 }}>{activity.title}</h1>
      </header>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        <p>Περιεχόμενο για «{activity.title}» θα προστεθεί όπως στο UFBB.</p>
      </div>
    </main>
  );
}
