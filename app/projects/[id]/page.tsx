"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SectionGrid from "@/components/SectionGrid";
import ActivityCard from "@/components/ActivityCard";
import { activities } from "@/lib/activities";

const LS_PROJECTS = "projects:list";
const LS_ACTIVITIES_PREFIX = "project:activities:";

type Project = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

function purgeProjectLocal(id: string) {
  try {
    localStorage.removeItem(LS_ACTIVITIES_PREFIX + id);
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(`state-project-${id}-`)) toDelete.push(k);
    }
    toDelete.forEach(k => localStorage.removeItem(k));
  } catch {}
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const raw = localStorage.getItem(LS_PROJECTS);
    if (raw) {
      try {
        const list: Project[] = JSON.parse(raw);
        setProject(list.find((x) => x.id === params.id) || null);
      } catch {}
    }
  }, [mounted, params.id]);

  const deleteCurrent = () => {
    if (!project) return;
    const ok = confirm(`Να διαγραφεί οριστικά το έργο «${project.title}»;`);
    if (!ok) return;

    // 1) αφαίρεση από projects:list
    const raw = localStorage.getItem(LS_PROJECTS);
    if (raw) {
      try {
        const list: Project[] = JSON.parse(raw);
        const next = list.filter(p => p.id !== project.id);
        localStorage.setItem(LS_PROJECTS, JSON.stringify(next));
      } catch {}
    }

    // 2) καθάρισμα όλων των δεδομένων του έργου
    purgeProjectLocal(project.id);

    // 3) επιστροφή στη λίστα έργων
    router.replace("/projects");
  };

  if (!mounted) return null;

  return (
    <main style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>{project?.title ?? "Έργο"}</h1>
          <p className="subtle" style={{ margin: "4px 0 0" }}>Δραστηριότητες / Συμβάσεις</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="badge"
            onClick={deleteCurrent}
            style={{ borderColor: "rgba(255,80,80,.5)", background: "rgba(255,80,80,.08)" }}
            title="Διαγραφή έργου"
          >
            Διαγραφή έργου
          </button>
        </div>
      </div>

      <SectionGrid>
        {activities.map((a) => (
          <ActivityCard
            key={a.slug}
            title={a.title}
            actions={[{ href: `/projects/${params.id}/${a.slug}`, label: "Άνοιγμα" }]}
          />
        ))}
      </SectionGrid>
    </main>
  );
}
