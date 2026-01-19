"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

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
  buildingManagerPhone?: string;
};

type Props = {
  storageKey: string;
  projectId?: string;
  activity?: string;
  onChangeStatus?: (s: JobStatus) => void;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const HEADER_TO_FIELD: Record<string, keyof Assignment> = {
  "CUSTOMER NAME": "customerName",
  "CUSTOMER PHONE": "customerPhone",
  "ADDRESS": "address",
  "CITY": "city",
  "WORK NAME": "workName",
  "ASSIGNED DATE": "assignedDate",
  "BUILDING MANAGER": "buildingManager",
  "SR ID": "srId",
  "BID": "bid",
  "CUSTOMER FLOOR": "customerFloor",
  "BUILDING MANAGER PHONE": "buildingManagerPhone",
  "ADMIN PHONE": "buildingManagerPhone",
  "ASSIGNED TO": "workName",
  "OLD": "bid",
  "\u039F\u03A1\u039F\u03A6\u039F\u03A3": "customerFloor",
  "\u0394\u0397\u039C\u039F\u03A3": "city",
  "\u0395\u03A1\u0393\u039F\u039B\u0391\u0392\u039F\u03A3": "workName",
  "\u03A3\u03A4\u039F\u0399\u03A7\u0395\u0399\u0391 \u03A0\u0395\u039B\u0391\u03A4\u0397": "customerName",
  "\u03A4\u0397\u039B\u0395\u03A6\u03A9\u039D\u039F \u0395\u03A0\u0399\u039A\u039F\u0399\u039D\u03A9\u039D\u0399\u0391\u03A3": "customerPhone",
  "\u03A4\u0397\u039B\u0391 \u03A0\u0391\u03A1\u0391\u0393\u0393\u0395\u039B\u0399\u0391\u03A3": "srId",
  "\u03A3\u03A4\u039F\u0399\u03A7\u0395\u0399\u0391 \u0394\u0399\u0391\u03A7\u0395\u0399\u03A1\u0399\u03A3\u03A4\u0397-\u039A\u0399\u039D\u0397\u03A4\u039F": "buildingManager",
  "\u03A4\u0397\u039B\u0395\u03A6\u03A9\u039D\u039F \u0395\u03A0\u0399\u039A\u039F\u0399\u039D\u03A9\u039D\u0399\u0391\u03A3 \u0394\u0399\u0391\u03A7\u0395\u0399\u03A1\u0399\u03A3\u03A4\u0397": "buildingManagerPhone",
  "\u0397\u039C. \u0391\u039D\u0391\u0398\u0395\u03A3\u0397\u03A3": "assignedDate",
};

const normalizeHeader = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const emptyFields = () => ({
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
  buildingManagerPhone: "",
});

function excelSerialToIso(value: number) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = value * 86400000;
  return new Date(excelEpoch.getTime() + ms).toISOString();
}

function normalizeAssignedDate(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return excelSerialToIso(value);
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && String(value).trim() !== "") return excelSerialToIso(asNumber);
  return String(value ?? "").trim();
}

function formatAssignedDate(value: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("el-GR");
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber)) return new Date(excelSerialToIso(asNumber)).toLocaleDateString("el-GR");
  return value;
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
  const [filterKey, setFilterKey] = useState("all");
  const [importInfo, setImportInfo] = useState("");
  const [importError, setImportError] = useState("");

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

  const buildAssignmentFromRow = (row: Record<string, any>): Assignment | null => {
    const fields = emptyFields();
    Object.entries(row).forEach(([key, value]) => {
      const normalized = normalizeHeader(key);
      const field = HEADER_TO_FIELD[normalized];
      if (!field) return;
      if (field === "assignedDate") {
        fields[field] = normalizeAssignedDate(value);
        return;
      }
      fields[field] = String(value ?? "").trim();
    });

    const hasValue = Object.values(fields).some((v) => String(v).trim().length > 0);
    if (!hasValue) return null;

    return {
      id: uid(),
      status: "assigned",
      createdAt: new Date().toISOString(),
      ...fields,
    };
  };

  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportInfo("");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

      const imported = rows
        .map(buildAssignmentFromRow)
        .filter(Boolean) as Assignment[];

      if (!imported.length) {
        setImportError("No valid rows found in file.");
        event.target.value = "";
        return;
      }

      setAssignments((prev) => [...imported, ...prev]);
      setJobStatus("assigned");
      setImportInfo(`Imported ${imported.length} rows.`);
    } catch {
      setImportError("Failed to parse file.");
    } finally {
      event.target.value = "";
    }
  };

  const filteredAssigned = useMemo(() => {
    const q = search.toLowerCase();
    const valuesFor = (a: Assignment) => {
      if (filterKey === "address") return [a.address];
      if (filterKey === "city") return [a.city];
      if (filterKey === "bid") return [a.bid];
      if (filterKey === "srId") return [a.srId];
      if (filterKey === "managerName") return [a.buildingManager];
      if (filterKey === "managerPhone") return [a.buildingManagerPhone];
      if (filterKey === "customerName") return [a.customerName];
      if (filterKey === "customerPhone") return [a.customerPhone];
      if (filterKey === "assignedTo") return [a.workName];
      if (filterKey === "assignedDate") return [a.assignedDate, formatAssignedDate(a.assignedDate)];
      if (filterKey === "customerFloor") return [a.customerFloor];
      return [
        a.workName,
        a.assignedDate,
        formatAssignedDate(a.assignedDate),
        a.address,
        a.city,
        a.bid,
        a.srId,
        a.customerFloor,
        a.buildingManager,
        a.buildingManagerPhone,
        a.customerName,
        a.customerPhone,
      ];
    };
    return assignments
      .filter((a) => a.status === "assigned")
      .filter((a) =>
        valuesFor(a)
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      );
  }, [assignments, search, filterKey]);

  const canOpen = Boolean(projectId && activity);
  const isFtth = activity === "ftth";
  const phaseParam = isFtth && storageKey.includes(":phase-") ? storageKey.split(":").pop() : "";

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
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <select
                className="input"
                value={filterKey}
                onChange={(e) => setFilterKey(e.currentTarget.value)}
                style={{ minWidth: 200 }}
                aria-label="Search filter"
              >
                <option value="all">{"\u038C\u03BB\u03B1"}</option>
                <option value="address">{"\u0394\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7"}</option>
                <option value="city">{"\u03A0\u03CC\u03BB\u03B7"}</option>
                <option value="bid">BID</option>
                <option value="srId">SR ID</option>
                <option value="managerName">{"\u0394\u03B9\u03B1\u03C7\u03B5\u03B9\u03C1\u03B9\u03C3\u03C4\u03AE\u03C2 \u039F\u03BD\u03CC\u03BC\u03B1"}</option>
                <option value="managerPhone">{"\u0394\u03B9\u03B1\u03C7\u03B5\u03B9\u03C1\u03B9\u03C3\u03C4\u03AE\u03C2 \u03A4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF"}</option>
                <option value="customerName">{"\u03A0\u03B5\u03BB\u03AC\u03C4\u03B7\u03C2 \u038C\u03BD\u03BF\u03BC\u03B1"}</option>
                <option value="customerPhone">{"\u03A0\u03B5\u03BB\u03AC\u03C4\u03B7\u03C2 \u03A4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF"}</option>
                <option value="assignedTo">{"\u0391\u03BD\u03B1\u03C4\u03AD\u03B8\u03B7\u03BA\u03B5 \u03C3\u03B5"}</option>
                <option value="assignedDate">{"\u0397\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B1 \u0391\u03BD\u03AC\u03B8\u03B5\u03C3\u03B7\u03C2"}</option>
                <option value="customerFloor">{"\u038C\u03C1\u03BF\u03C6\u03BF\u03C2"}</option>
              </select>
            </div>
            <button className="badge" type="button" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancel" : "+ Add"}
            </button>
          </div>

          {showForm && (
            <div className="light-card" style={{ marginBottom: 12, boxShadow: "none" }}>
              {isFtth && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportChange} />
                  {importInfo && <span style={{ fontSize: 12, color: "#2f855a" }}>{importInfo}</span>}
                  {importError && <span style={{ fontSize: 12, color: "#c53030" }}>{importError}</span>}
                </div>
              )}
              <div className="form-grid">
                <input
                  className="input"
                  placeholder="Assigned date"
                  value={form.assignedDate}
                  onChange={(e) => updateForm("assignedDate", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateForm("city", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="Building manager"
                  value={form.buildingManager}
                  onChange={(e) => updateForm("buildingManager", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="SR ID"
                  value={form.srId}
                  onChange={(e) => updateForm("srId", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="BID"
                  value={form.bid}
                  onChange={(e) => updateForm("bid", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="Customer floor"
                  value={form.customerFloor}
                  onChange={(e) => updateForm("customerFloor", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="Customer name"
                  value={form.customerName}
                  onChange={(e) => updateForm("customerName", e.currentTarget?.value ?? "")}
                />
                <input
                  className="input"
                  placeholder="Customer phone"
                  value={form.customerPhone}
                  onChange={(e) => updateForm("customerPhone", e.currentTarget?.value ?? "")}
                />
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
              <div
                className="table-lite__row table-lite__head"
                style={{ gridTemplateColumns: "1.2fr 1fr 1.2fr 1.2fr .9fr .9fr .8fr" }}
              >
                <div>Location</div>
                <div>Identifiers</div>
                <div>{"\u03A3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03B4\u03B9\u03B1\u03C7\u03B5\u03B9\u03C1\u03B9\u03C3\u03C4\u03AE"}</div>
                <div>{"\u03A3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03C0\u03B5\u03BB\u03AC\u03C4\u03B7"}</div>
                <div>Assigned to</div>
                <div>Assigned date</div>
                <div>Customer floor</div>
              </div>
              {filteredAssigned.map((a) => (
                <div
                  className="table-lite__row"
                  key={a.id}
                  style={{
                    cursor: canOpen ? "pointer" : "default",
                    gridTemplateColumns: "1.2fr 1fr 1.2fr 1.2fr .9fr .9fr .8fr",
                  }}
                  onClick={() => {
                    if (canOpen) {
                      const url = phaseParam
                        ? `/projects/${projectId}/${activity}/assignment/${a.id}?phase=${encodeURIComponent(phaseParam)}`
                        : `/projects/${projectId}/${activity}/assignment/${a.id}`;
                      window.open(url, "_blank");
                    }
                  }}
                >
                  <div style={{ display: "grid", rowGap: 4, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>Address:</span> {a.address || "-"}
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>City:</span> {a.city || "-"}
                    </div>
                  </div>
                  <div style={{ display: "grid", rowGap: 4, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>BID:</span> {a.bid || "-"}
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>SR ID:</span> {a.srId || "-"}
                    </div>
                  </div>
                  <div style={{ display: "grid", rowGap: 4, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>{"\u038C\u03BD\u03BF\u03BC\u03B1:"}</span> {a.buildingManager || "-"}
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>{"\u03A4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF:"}</span> {a.buildingManagerPhone || "-"}
                    </div>
                  </div>
                  <div style={{ display: "grid", rowGap: 4, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>{"\u038C\u03BD\u03BF\u03BC\u03B1:"}</span> {a.customerName || "-"}
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>{"\u03A4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF:"}</span> {a.customerPhone || "-"}
                    </div>
                  </div>
                  <div style={{ fontSize: 12 }}>{a.workName || "-"}</div>
                  <div style={{ fontSize: 12 }}>{formatAssignedDate(a.assignedDate)}</div>
                  <div style={{ fontSize: 12 }}>{a.customerFloor || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
