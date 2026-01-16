"use client";

import { useEffect, useMemo, useState } from "react";

type Params = { params: { id: string; activity: string; assignId: string } };

type TabId = "customer" | "inspection" | "budget" | "history" | "note" | "system";

export default function AssignmentDetailPage({ params }: Params) {
  const [item, setItem] = useState<any>(null);
  const [title, setTitle] = useState("Assignment");
  const [activeTab, setActiveTab] = useState<TabId>("customer");

  useEffect(() => {
    const key = `project:${params.id}:${params.activity}:assignments`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const list = JSON.parse(raw);
      setItem(list.find((x: any) => x.id === params.assignId) || null);
    } catch {}
  }, [params.id, params.activity, params.assignId]);

  useEffect(() => {
    if (!item) return;
    const nextTitle = item.customerName
      ? `${item.customerName} - ${item.workName || "Project details"}`
      : item.workName || "Project details";
    setTitle(nextTitle);
    document.title = nextTitle;
  }, [item]);

  const tabs = useMemo(
    () => [
      { id: "customer" as const, label: "Πελάτης - Στοιχεία έργου" },
      { id: "inspection" as const, label: "Αυτοψία Report" },
      { id: "budget" as const, label: "Λεπτομέρειες προϋπολογισμού" },
      { id: "history" as const, label: "Ιστορία" },
      { id: "note" as const, label: "Σημείωμα" },
      { id: "system" as const, label: "Σύστημα" },
    ],
    []
  );

  if (!item) return <main style={{ padding: 24 }}>Assignment not found.</main>;

  return (
    <main style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 12 }}>{title}</h1>

      <div style={{ display: "flex", gap: 6, borderBottom: "1px solid #e6e6e6", marginBottom: 16 }}>
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "6px 10px",
                border: "1px solid #dcdcdc",
                borderBottom: isActive ? "2px solid #2b6cb0" : "1px solid #dcdcdc",
                borderRadius: "6px 6px 0 0",
                background: isActive ? "#f7fafc" : "#fff",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "customer" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={{ border: "1px solid #e6e6e6", borderRadius: 8, padding: 16 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Στοιχεία πελάτη</h2>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 6 }}>
              <div>Όνομα</div>
              <div>{item.customerName || "-"}</div>
              <div>Τηλέφωνο</div>
              <div>{item.customerPhone || "-"}</div>
              <div>Διεύθυνση</div>
              <div>{item.address || "-"}</div>
              <div>Πόλη</div>
              <div>{item.city || "-"}</div>
              <div>Όροφος</div>
              <div>{item.customerFloor || "-"}</div>
              <div>Διαχειριστής κτιρίου</div>
              <div>{item.buildingManager || "-"}</div>
            </div>
          </section>

          <section style={{ border: "1px solid #e6e6e6", borderRadius: 8, padding: 16 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Στοιχεία έργου</h2>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 6 }}>
              <div>Όνομα έργου</div>
              <div>{item.workName || "-"}</div>
              <div>Ημ/νία ανάθεσης</div>
              <div>{item.assignedDate || "-"}</div>
              <div>SR ID</div>
              <div>{item.srId || "-"}</div>
              <div>BID</div>
              <div>{item.bid || "-"}</div>
              <div>Ημ/νία δημιουργίας</div>
              <div>{item.createdAt || "-"}</div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "inspection" && (
        <section style={{ border: "1px solid #e6e6e6", borderRadius: 8, padding: 16 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Αυτοψία Report</h2>
        </section>
      )}
    </main>
  );
}
