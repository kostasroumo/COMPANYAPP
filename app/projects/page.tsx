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

  // --- state για modal "Νέο έργο" ---
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  // --- state για modal "Διαγραφή έργου" ---
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const raw = localStorage.getItem(LS_PROJECTS);
    if (raw) {
      try { setProjects(JSON.parse(raw)); } catch {}
    }
  }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_PROJECTS, JSON.stringify(projects));
  }, [mounted, projects]);

  // === ΔΗΜΙΟΥΡΓΙΑ ΕΡΓΟΥ ===
  const createProject = async (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

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

    const row: Project = { id, title: trimmed, createdAt: now, updatedAt: now };
    setProjects(prev => [row, ...prev]);

    router.push(`/projects/${id}`);
  };

  // === ΔΙΑΓΡΑΦΗ ΕΡΓΟΥ (πραγματική εκτέλεση) ===
  const performDeleteProject = () => {
    if (!deleteProjectId) return;
    const id = deleteProjectId;
    const row = projects.find(p => p.id === id);

    // 1) σβήσε από τον πίνακα
    const next = projects.filter(p => p.id !== id);
    setProjects(next);
    localStorage.setItem(LS_PROJECTS, JSON.stringify(next));

    // 2) σβήσε όλα τα τοπικά δεδομένα του έργου
    purgeProjectLocal(id);

    // καθάρισε το state του modal
    setDeleteProjectId(null);
    setDeleteStep(1);
  };

  // handler που ανοίγει το modal διαγραφής (βήμα 1)
  const requestDeleteProject = (id: string) => {
    setDeleteProjectId(id);
    setDeleteStep(1);
  };

  // === Handlers για modal "Νέο έργο" ===
  const openNewProjectModal = () => {
    setNewProjectTitle("");
    setNewProjectOpen(true);
  };

  const closeNewProjectModal = () => {
    setNewProjectOpen(false);
  };

  const submitNewProject = () => {
    const t = newProjectTitle.trim();
    if (!t) return;
    createProject(t);
    setNewProjectOpen(false);
    setNewProjectTitle("");
  };

  if (!mounted) return null;

  const projectToDelete = deleteProjectId
    ? projects.find(p => p.id === deleteProjectId) ?? null
    : null;

  return (
    <main>
      <h1 className="section-title">Έργα</h1>
      <p className="subtle">Δημιούργησε νέο έργο και άνοιξε δραστηριότητες.</p>

      <div style={{ margin: "12px 0 20px", display: "flex", gap: 8 }}>
        <button className="badge" onClick={openNewProjectModal}>+ Νέο έργο</button>
      </div>

      {projects.length === 0 ? (
        <div className="tile">
          <div className="tile__title">Δεν υπάρχουν έργα ακόμα</div>
          <button className="badge" onClick={openNewProjectModal}>Ξεκίνα με ένα νέο έργο</button>
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
                  onClick={() => requestDeleteProject(p.id)}
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

      {/* MODAL: Νέο έργο */}
      {newProjectOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onMouseDown={closeNewProjectModal}
        >
          <div
            style={{
              background: "var(--bg-elevated, #020617)",
              borderRadius: 12,
              padding: 20,
              maxWidth: 420,
              width: "90%",
              boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
              border: "1px solid rgba(148,163,184,0.35)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Νέο έργο</h2>
              <button
                type="button"
                onClick={closeNewProjectModal}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  color: "var(--text-muted, #9ca3af)",
                }}
                aria-label="Κλείσιμο"
              >
                ×
              </button>
            </div>

            <p className="subtle" style={{ marginBottom: 12 }}>
              Δώσε έναν τίτλο στο έργο σου.
            </p>

            <label
              htmlFor="new-project-title"
              className="subtle"
              style={{ display: "block", marginBottom: 4 }}
            >
              Τίτλος έργου
            </label>
            <input
              id="new-project-title"
              className="input"
              placeholder="π.χ. ΟΙΚΟΔΟΜΗ Α"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitNewProject();
                }
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="badge"
                onClick={closeNewProjectModal}
              >
                Ακύρωση
              </button>
              <button
                type="button"
                className="badge"
                onClick={submitNewProject}
                disabled={!newProjectTitle.trim()}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Διαγραφή έργου με ΔΥΟ βήματα */}
      {projectToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onMouseDown={() => {
            setDeleteProjectId(null);
            setDeleteStep(1);
          }}
        >
          <div
            style={{
              background: "var(--bg-elevated, #020617)",
              borderRadius: 12,
              padding: 20,
              maxWidth: 440,
              width: "90%",
              boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
              border: "1px solid rgba(248,113,113,0.5)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#fecaca" }}>Διαγραφή έργου</h2>
              <button
                type="button"
                onClick={() => { setDeleteProjectId(null); setDeleteStep(1); }}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  color: "var(--text-muted, #9ca3af)",
                }}
                aria-label="Κλείσιμο"
              >
                ×
              </button>
            </div>

            {deleteStep === 1 ? (
              <>
                <p className="subtle" style={{ marginBottom: 8 }}>
                  Να διαγραφεί οριστικά το έργο «{projectToDelete.title}»;
                </p>
                <p className="subtle" style={{ marginBottom: 12 }}>
                  Η ενέργεια δεν αναιρείται. Όλα τα τοπικά δεδομένα του έργου θα χαθούν.
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <button
                    type="button"
                    className="badge"
                    onClick={() => { setDeleteProjectId(null); setDeleteStep(1); }}
                  >
                    Άκυρο
                  </button>
                  <button
                    type="button"
                    className="badge"
                    onClick={() => setDeleteStep(2)}
                  >
                    Συνέχεια
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="subtle" style={{ marginBottom: 8, color: "#fecaca" }}>
                  Είσαι σίγουρος ότι θέλεις να διαγράψεις το έργο «{projectToDelete.title}»;
                </p>
                <p className="subtle" style={{ marginBottom: 12 }}>
                  Πατώντας «Οριστική διαγραφή» θα αφαιρεθεί το έργο από τη λίστα
                  και θα καθαριστούν όλα τα σχετικά δεδομένα από τον browser.
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <button
                    type="button"
                    className="badge"
                    onClick={() => setDeleteStep(1)}
                  >
                    Πίσω
                  </button>
                  <button
                    type="button"
                    className="badge"
                    style={{
                      borderColor: "rgba(248,113,113,0.8)",
                      background: "rgba(248,113,113,0.12)",
                    }}
                    onClick={performDeleteProject}
                  >
                    Οριστική διαγραφή
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
