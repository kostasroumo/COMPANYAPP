import { notFound } from "next/navigation";
import Link from "next/link";
import "@/app/styles/base.css"; // (αν δεν το φορτώνεις ήδη στο root layout)

import { activities, getActivityBySlug } from "@/lib/activities";

type Params = { params: { slug: string } };

// Προαιρετικό: για SSG
export function generateStaticParams() {
  return activities.map(a => ({ slug: a.slug }));
}
export const dynamicParams = false;

// Προαιρετικό: δυναμικός τίτλος
export function generateMetadata({ params }: Params) {
  const act = getActivityBySlug(params.slug);
  return { title: act ? `${act.title} • Δραστηριότητες` : "Δραστηριότητες" };
}

export default function ActivityPage({ params }: Params) {
  const act = getActivityBySlug(params.slug);
  if (!act) notFound();

  return (
    <main style={{ padding: "24px" }}>
      <h1 className="section-title">{act.title}</h1>
      <p className="subtle">Ενέργειες για τη δραστηριότητα.</p>

      {/* Γρήγορες ενέργειες/υποενότητες — προσαρμόζεις paths */}
      <div className="grid" style={{ marginTop: 18 }}>
        <div className="tile">
          <div className="tile__title">Βήματα</div>
          <div className="tile__meta">
            <Link className="chip" href={`/activities/${act.slug}/steps`}>Άνοιγμα</Link>
            <Link className="chip chip--ghost" href={`/activities/${act.slug}/steps?newTab=1`}>Νέα καρτέλα</Link>
          </div>
        </div>

        <div className="tile">
          <div className="tile__title">Υλικά</div>
          <div className="tile__meta">
            <Link className="chip" href={`/activities/${act.slug}/materials`}>Άνοιγμα</Link>
            <Link className="chip chip--ghost" href={`/activities/${act.slug}/materials?newTab=1`}>Νέα καρτέλα</Link>
          </div>
        </div>

        <div className="tile">
          <div className="tile__title">Φωτογραφίες</div>
          <div className="tile__meta">
            <Link className="chip" href={`/activities/${act.slug}/photos`}>Άνοιγμα</Link>
            <Link className="chip chip--ghost" href={`/activities/${act.slug}/photos?newTab=1`}>Νέα καρτέλα</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
