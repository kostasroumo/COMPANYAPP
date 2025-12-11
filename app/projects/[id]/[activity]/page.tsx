"use client";

import { useEffect, useState } from "react";
import UFBBClient from "@/app/activities/[slug]/UFBBClient";
import { getActivityBySlug } from "@/lib/activities";

const LS_ACTIVITIES_PREFIX = "project:activities:";
const LS_PROJECTS = "projects:list";

type ActivityPayload = { sections: any[] };
type Project = { id: string; title: string; createdAt: string; updatedAt: string };

export default function ProjectActivityPage({ params }: { params: { id: string; activity: string } }) {
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<any[] | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    // project meta
    const rawProjects = localStorage.getItem(LS_PROJECTS);
    if (rawProjects) {
      try {
        const list: Project[] = JSON.parse(rawProjects);
        setProject(list.find(x => x.id === params.id) || null);
      } catch {}
    }

    // sections για συγκεκριμένη δραστηριότητα
    const raw = localStorage.getItem(LS_ACTIVITIES_PREFIX + params.id);
    if (raw) {
      try {
        const payload: Record<string, ActivityPayload> = JSON.parse(raw);
        setSections(payload[params.activity]?.sections ?? []);
      } catch {}
    }
  }, [mounted, params.id, params.activity]);

  if (!mounted) return null;
  if (!sections) return <main><p>Φόρτωση…</p></main>;

  const meta = getActivityBySlug(params.activity);

  return (
    <main>
      <h1 className="section-title">{project?.title ?? "Έργο"} — {meta?.title ?? params.activity.toUpperCase()}</h1>
      <p className="subtle">Ενότητες (βήματα, υλικά, φωτογραφίες)</p>

      <UFBBClient
        sections={sections}
        storageKey={`project-${params.id}-${params.activity}`}
      />
    </main>
  );
}
