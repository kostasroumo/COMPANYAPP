"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { activities } from "@/lib/activities";

type Project = { id: string; title: string; createdAt: string; updatedAt: string };

const LS_PROJECTS = "projects:list";
const LS_ACTIVITIES_PREFIX = "project:activities:";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Βοηθητικό: καθάρισε ΟΛΑ τα τοπικά δεδομένα ενός έργου
function purgeProjectLocal(id: string) {
  try {
    // payload δραστηριοτήτων
    localStorage.removeItem(LS_ACTIVITIES_PREFIX + id);
    // state του UFBBClient και λοιπών δραστηριοτήτων
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(`state-project-${id}-`)) toDelete.push(k);
    }
    toDelete.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export default function ProjectsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const raw = localStorage.getItem(LS_PROJECTS);
    if (raw) { try { setProjects(JSON.parse(raw)); } catch {} }
  }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_PROJECTS, JSON.stringify(projects));
  }, [mounted, projects]);

  const createProject = async () => {
    const title = prompt("Τίτλος έργου; π.χ. ΟΙΚΟΔΟΜΗ Α");
    if (!title) return;

    const id = uid();
    const now = new Date().toISOString();

    // seed δραστηριοτήτων
    let ufbbTemplate: any = null;
    try {
      const r = await fetch(`/data/ufbb.json?v=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        const json = await r.json();
        ufbbTemplate = Array.isArray(json) ? { sections: json } : json;
      }
    } catch {}

    const payload: Record<string, { sections: any[] }> = {};
    activities.forEach(a => {
      payload[a.slug] = a.slug === "ufbb" && ufbbTemplate?.sections
        ? { sections: ufbbTemplate.sections }
        : { sections: [] };
    });
    localStorage.setItem(LS_ACTIVITIES_PREFIX + id, JSON.stringify(payload));

    const row: Project = { id, title, createdAt: now, updatedAt: now };
    setProjects(prev => [row, ...prev]);
    router.push(`/projects/${id}`);
  };

  const deleteProject = (id: string) => {
    const row = projects.find(p => p.id === id);
    const ok = confirm(`Να διαγραφεί οριστικά το έργο «${row?.title ?? id}»;\n(Η ενέργεια δεν αναιρείται)`);
    if (!ok) return;

    // 1) σβήσε από τον πίνακα
    const next = projects.filter(p => p.id !== id);
    setProjects(next);
    localStorage.setItem(LS_PROJECTS, JSON.stringify(next));

    // 2) σβήσε όλα τα τοπικά δεδομένα του έργου
    purgeProjectLocal(id);
  };

  if (!mounted) return null;

  return (
    <main>
      <h1 className="section-title">Έργα</h1>
      <p className="subtle">Δημιούργησε νέο έργο και άνοιξε δραστηριότητες.</p>

      <div style={{ margin: "12px 0 20px", display: "flex", gap: 8 }}>
        <button className="badge" onClick={createProject}>+ Νέο έργο</button>
      </div>

      {projects.length === 0 ? (
        <div className="tile">
          <div className="tile__title">Δεν υπάρχουν έργα ακόμα</div>
          <button className="badge" onClick={createProject}>Ξεκίνα με ένα νέο έργο</button>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {projects.map(p => (
            <div key={p.id} className="tile" style={{ display: "grid", gap: 8 }}>
              <div className="tile__title" title={p.id}>{p.title}</div>
              <div className="subtle">Τελευταία ενημέρωση: {new Date(p.updatedAt).toLocaleString()}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="badge" onClick={() => router.push(`/projects/${p.id}`)}>Άνοιγμα</button>
                <button
                  className="badge"
                  onClick={() => deleteProject(p.id)}
                  style={{ borderColor: "rgba(255,80,80,.5)", background: "rgba(255,80,80,.08)" }}
                  title="Διαγραφή έργου"
                >
                  Διαγραφή
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
