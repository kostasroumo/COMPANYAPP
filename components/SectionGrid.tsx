import ActivityCard from "./ActivityCard";
import { ACTIVITIES } from "@/lib/activities";

export default function SectionGrid() {
  return (
    <div style={{
      display: "grid", gap: 12,
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))"
    }}>
      {ACTIVITIES.map((a) => <ActivityCard key={a.slug} a={a} />)}
    </div>
  );
}
