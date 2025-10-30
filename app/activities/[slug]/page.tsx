import { notFound } from "next/navigation";
import Link from "next/link";
import { loadPublicJson } from "@/lib/loadJson";
import { getActivityBySlug, activities } from "@/lib/activities";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Params) {
  const act = getActivityBySlug(params.slug);
  return { title: act ? `${act.title} • Δραστηριότητες` : "Δραστηριότητες" };
}

type UfbbData = {
  title: string;
  sections: {
    name: string;
    types?: string[];
    steps: string[];
    materials?: string[];
    comments?: string;
  }[];
};

export default async function ActivityPage({ params }: Params) {
  const act = getActivityBySlug(params.slug);
  if (!act) notFound();

  // Αν είναι UFBB, φέρε JSON, αλλιώς δείξε τις υποενότητες dummy (όπως πριν)
  const isUFBB = params.slug === "ufbb";
  let ufbb: UfbbData | null = null;
  if (isUFBB) {
    ufbb = await loadPublicJson<UfbbData>("data/ufbb.json");
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1 className="section-title">{act.title}</h1>
      <p className="subtle">Ενέργειες για τη δραστηριότητα.</p>

      {isUFBB && ufbb ? (
        <div className="grid" style={{ marginTop: 18 }}>
          {ufbb.sections.map((s) => (
            <section key={s.name} className="section">
              <h3>{s.name}</h3>

              {s.types && s.types.length > 0 && (
                <div className="meta-row">
                  {s.types.map((t) => (
                    <span key={t} className="badge">{t}</span>
                  ))}
                </div>
              )}

              <ul className="checklist">
                {s.steps.map((step, i) => (
                  <li key={i}>
                    <input type="checkbox" aria-label={`Ολοκλήρωση: ${step}`} />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>

              {s.materials && s.materials.length > 0 && (
                <div className="meta-row">
                  {s.materials.map((m) => (
                    <span key={m} className="badge">{m}</span>
                  ))}
                </div>
              )}

              {s.comments && <p className="subtle">Σχόλια: {s.comments}</p>}

              <div style={{ marginTop: 12 }}>
                <Link className="chip" href="#">Άνοιγμα</Link>
                <Link className="chip chip--ghost" href="#">Νέα καρτέλα</Link>
              </div>
            </section>
          ))}
        </div>
      ) : (
        // generic cards για άλλα slugs (όπως πριν)
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
      )}
    </main>
  );
}
