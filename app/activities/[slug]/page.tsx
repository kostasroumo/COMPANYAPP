import { notFound } from "next/navigation";
import { activities, getActivityBySlug } from "@/lib/activities";
import { loadPublicJson } from "@/lib/loadJson";
import UFBBClient from "./UFBBClient";
import ActivityPipeline from "./ActivityPipeline";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}
export const dynamicParams = false;

type UfbbData = {
  title: string;
  sections: {
    name: string;
    types?: string[];
    steps: string[];
    materials?: { name: string; unit?: string; trackStock?: boolean }[];
    comments?: string;
  }[];
};

export default async function ActivityPage({ params }: Params) {
  const act = getActivityBySlug(params.slug);
  if (!act) notFound();

  // Unique key ana drasthriothta/fasi
  const activityKey = `activity:${params.slug}`;

  // UFBB
  if (params.slug === "ufbb") {
    const ufbb = await loadPublicJson<UfbbData>("data/ufbb.json");
    return (
      <main style={{ padding: 24 }}>
        {/* Pipeline panta panw */}
        <ActivityPipeline storageKey={activityKey} />

        <h1 className="section-title" style={{ marginTop: 18 }}>
          {ufbb.title}
        </h1>
        <p className="subtle">Ενέργειες για τη δραστηριότητα.</p>

        {/* Krataei xwrista state apo to pipeline */}
        <UFBBClient sections={ufbb.sections} storageKey={`${activityKey}:ufbb`} />
      </main>
    );
  }

  // Oles oi alles drasthriothtes (proswrino placeholder)
  return (
    <main style={{ padding: 24 }}>
      {/* Pipeline panta panw */}
      <ActivityPipeline storageKey={activityKey} />

      <h1 className="section-title" style={{ marginTop: 18 }}>
        {act.title}
      </h1>
      <p className="subtle">Δεν έχουν οριστεί ακόμη ενότητες για αυτή τη δραστηριότητα.</p>

      <div className="grid" style={{ marginTop: 18 }}>
        <div className="tile">
          <div className="tile__title">Βήματα</div>
          <div className="subtle">Θα προστεθούν σύντομα.</div>
        </div>
        <div className="tile">
          <div className="tile__title">Υλικά</div>
          <div className="subtle">Θα προστεθούν σύντομα.</div>
        </div>
        <div className="tile">
          <div className="tile__title">Σχόλια</div>
          <div className="subtle">Θα προστεθούν σύντομα.</div>
        </div>
      </div>
    </main>
  );
}
