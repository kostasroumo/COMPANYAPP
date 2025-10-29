"use client";
import Link from "next/link";
import type { Activity } from "@/lib/activities";

export default function ActivityCard({ a }: { a: Activity }) {
  const href = `/activities/${a.slug}`;
  return (
    <div style={{
      borderRadius: 16, border: "1px solid #1f2937", padding: 14,
      background: "#0f172a", color: "#e6edf3", display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div>
        <div style={{ fontWeight: 700 }}>{a.title}</div>
        {a.description && <div style={{ opacity: 0.8, fontSize: ".9rem", marginTop: 4 }}>{a.description}</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Link href={href} className="px-3 py-1" style={{ border: "1px solid #374151", borderRadius: 10 }}>Άνοιγμα</Link>
        <a href={href} target="_blank" rel="noopener" className="px-3 py-1" style={{ border: "1px solid #374151", borderRadius: 10 }}>Νέα καρτέλα</a>
      </div>
    </div>
  );
}
