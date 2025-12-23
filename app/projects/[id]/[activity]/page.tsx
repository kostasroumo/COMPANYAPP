"use client";

import { useEffect, useState } from "react";
import ActivityPipeline from "@/app/activities/[slug]/ActivityPipeline";
import { getActivityBySlug } from "@/lib/activities";

const LS_PROJECTS = "projects:list";

type Project = { id: string; title: string; createdAt: string; updatedAt: string };

export default function ProjectActivityPage({ params }: { params: { id: string; activity: string } }) {
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  const activityKey = `project:${params.id}:${params.activity}`;

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

  if (!mounted) return null;

  const meta = getActivityBySlug(params.activity);

  return (
    <main style={{ padding: "24px" }}>
      <h1 className="section-title" style={{ marginTop: 0, marginBottom: 12 }}>
        {project?.title ?? "Project"} — {meta?.title ?? params.activity.toUpperCase()}
      </h1>

      <ActivityPipeline storageKey={activityKey} />
    </main>
  );
}
