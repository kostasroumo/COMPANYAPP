"use client";

import { useEffect, useMemo, useState } from "react";

export type JobStatus =
  | "assigned"
  | "scheduled"
  | "in_progress"
  | "incomplete"
  | "to_validate"
  | "done";

const PIPELINE: { id: JobStatus; label: string; sub: string }[] = [
  { id: "assigned", label: "Assigned", sub: "Assigned" },
  { id: "scheduled", label: "Scheduled", sub: "Scheduled" },
  { id: "in_progress", label: "In progress", sub: "In progress" },
  { id: "incomplete", label: "Incomplete", sub: "Incomplete" },
  { id: "to_validate", label: "To validate", sub: "To validate" },
  { id: "done", label: "Done", sub: "Done" },
];

type Assignment = {
  id: string;
  status: JobStatus;
  createdAt: string;
  workName: string;
  assignedDate: string;
  address: string;
  city: string;
  buildingManager: string;
  srId: string;
  bid: string;
  customerFloor: string;
  customerName: string;
  customerPhone: string;
};

type Props = {
  storageKey: string;
  projectId: string;
  activity: string;
  onChangeStatus?: (s: JobStatus) => void;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ActivityPipeline({
  storageKey,
  projectId,
  activity,
  onChangeStatus,
}: Props) {
  const statusKey = `${storageKey}:status`;
  const assignmentsKey = `${storageKey}:assignments`;

  const [jobStatus, setJobStatus] = useState<JobStatus>("assigned");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(() => ({
    workName: "",
    assignedDate: "",
    address: "",
    city: "",
    buildingManager: "",
    srId: "",
    bid: "",
    customerFloor: "",
    customerName: "",
    customerPhone: "",
  }));

  const updateForm = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value ?? "" }));

  useEffect(() => {
    const raw = localStorage.getItem(statusKey);
    if (raw && PIPELINE.some((p) => p.id === raw)) setJobStatus(raw as JobStatus);
    const rawA = localStorage.getItem(assignmentsKey);
    if (rawA) {
      try {
        setAssignments(JSON.parse(rawA));
      } catch {}
    }
  }, [statusKey, assignmentsKey]);

  useEffect(() => {
    localStorage.setItem(statusKey, jobStatus);
    onChangeStatus?.(jobStatus);
  }, [jobStatus, statusKey, onChangeStatus]);

  useEffect(() => {
    localStorage.setItem(assignmentsKey, JSON.stringify(assignments));
  }, [assignments, assignmentsKey]);

  const counts = useMemo(() => {
    const c: Record<JobStatus, number> = {
      assigned: 0,
      scheduled: 0,
      in_progress: 0,
      incomplete: 0,
      to_validate: 0,
      done: 0,
    };
    assignments.forEach((a) => (c[a.status] += 1));
    return c;
  }, [assignments]);

  const resetForm = () =>
    setForm({
      workName: "",
      assignedDate: "",
      address: "",
      city: "",
      buildingManager: "",
      srId: "",
      bid: "",
      customerFloor: "",
      customerName: "",
      customerPhone: "",
    });

  const createAssignment = () => {
    if (!form.workName.trim() && !form.address.trim()) return;
    const entry: Assignment = {
      id: uid(),
      status: "assigned",
      createdAt: new Date().toISOString(),
      workName: form.workName.trim(),
      assignedDate: form.assignedDate.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      buildingManager: form.buildingManager.trim(),
      srId: form.srId.trim(),
      bid: form.bid.trim(),
      customerFloor: form.customerFloor.trim(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
    };
    setAssignments((prev) => [entry, ...prev]);
    setJobStatus("assigned");
    resetForm();
    setShowForm(false);
  };

  const filteredAssigned = useMemo(() => {
    const q = search.toLowerCase();
    return assignments
      .filter((a) => a.status === "assigned")
      .filter((a) =>
        [a.workName, a.address, a.city, a.bid, a.srId, a.customerName]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      );
  }, [assignments, search]);

  return (
    <>
      <div className="pipeline" role="tablist" aria-label="Pipeline">
        {PIPELINE.map((s) => {
          const active = s.id === jobStatus;
          return (
            <button
              key={s.id}
              type="button"
              className={`pipeline__card pipeline__card--${s.id} ${active ? "is-active" : ""}`}
              onClick={() => {
                setJobStatus(s.id);
                if (s.id !== "assigned") setShowForm(false);
              }}
              role="tab"
              aria-selected={active}
            >
              <div className="pipeline__count">{counts[s.id]}</div>
              <div className="pipeline__label">{s.label}</div>
              <div className="pipeline__sub">{s.sub}</div>
            </button>
          );
        })}
      </div>

      {jobStatus === "assigned" && (
        <section className="assignments light-card">
          <div className="assignments__header" style={{ gap: 8 }}>
            <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="input"
                placeholder="Αναζήτηση..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
            </div>
            <button className="badge" type="button" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Κλείσιμο" : "+ Προσθέτω"}
            </button>
          </div>

          {showForm && (
            <div className="light-card" style={{ marginBottom: 12, boxShadow: "none" }}>
              <div className="form-grid">
                <input className="input" placeholder="Όνομα εργασίας" value={form.workName} onChange={(e) => updateForm("workName", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="Ημ/νία ανάθεσης" value={form.assignedDate} onChange={(e) => updateForm("assignedDate", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="Διεύθυνση" value={form.address} onChange={(e) => updateForm("address", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="Πόλη" value={form.city} onChange={(e) => updateForm("city", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="Διαχειριστής κτιρίου" value={form.buildingManager} onChange={(e) => updateForm("buildingManager", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="SR ID" value={form.srId} onChange={(e) => updateForm("srId", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="BID" value={form.bid} onChange={(e) => updateForm("bid", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="Customer floor" value={form.customerFloor} onChange={(e) => updateForm("customerFloor", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="Customer name" value={form.customerName} onChange={(e) => updateForm("customerName", e.currentTarget?.value ?? "")} />
                <input className="input" placeholder="Customer phone" value={form.customerPhone} onChange={(e) => updateForm("customerPhone", e.currentTarget?.value ?? "")} />
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="badge" type="button" onClick={() => { resetForm(); setShowForm(false); }}>
                  Cancel
                </button>
                <button className="badge" type="button" onClick={createAssignment}>
                  Create
                </button>
              </div>
            </div>
          )}

          {filteredAssigned.length === 0 ? (
            <div className="empty-state">No assignments yet.</div>
          ) : (
            <div className="table-lite">
              <div className="table-lite__row table-lite__head">
                <div>Όνομα εργασίας</div>
                <div>Ημ/νία Ανάθεσης</div>
                <div>Κατάσταση</div>
                <div>Διεύθυνση</div>
                <div>Διαχειριστής κτιρίου</div>
                <div>Πόλη</div>
                <div>Αναγνωριστικό SR</div>
                <div>BID</div>
                <div>Customer floor</div>
              </div>
              {filteredAssigned.map((a) => (
                <div
                  className="table-lite__row"
                  key={a.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => window.open(`/projects/${projectId}/${activity}/assignment/${a.id}`, "_blank")}
                >
                  <div>{a.workName || "-"}</div>
                  <div>{a.assignedDate || "-"}</div>
                  <div>New</div>
                  <div>{a.address || "-"}</div>
                  <div>{a.buildingManager || "-"}</div>
                  <div>{a.city || "-"}</div>
                  <div>{a.srId || "-"}</div>
                  <div>{a.bid || "-"}</div>
                  <div>{a.customerFloor || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
