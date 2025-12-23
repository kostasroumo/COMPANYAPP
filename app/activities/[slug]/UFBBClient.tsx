"use client";

import { useEffect, useState } from "react";

type Material = { name: string; unit?: string; trackStock?: boolean };
type Section = {
  name: string;
  types?: string[];
  steps: string[];
  materials?: Material[];
  comments?: string;
};

type Props = { sections: Section[]; storageKey?: string };

type StepState = { checked: boolean; when?: string }; // ISO datetime
type SectionState = {
  steps: Record<string, StepState>; // key = step title
  stock: Record<string, number>; // key = material name
  note?: string;
  open?: boolean;
};

export default function UFBBClient({ sections, storageKey = "ufbb-state" }: Props) {
  const [state, setState] = useState<Record<string, SectionState>>({});

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {}
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const toggleStep = (sec: string, step: string, next: boolean) => {
    setState((prev) => {
      const s = prev[sec] ?? { steps: {}, stock: {} };
      const current = s.steps[step] ?? { checked: false };
      return {
        ...prev,
        [sec]: {
          ...s,
          steps: {
            ...s.steps,
            [step]: {
              checked: next,
              when: next ? current.when ?? new Date().toISOString() : undefined,
            },
          },
        },
      };
    });
  };

  const setDate = (sec: string, step: string, dt: string) => {
    setState((prev) => {
      const s = prev[sec] ?? { steps: {}, stock: {} };
      const current = s.steps[step] ?? { checked: false };
      return {
        ...prev,
        [sec]: {
          ...s,
          steps: { ...s.steps, [step]: { ...current, when: dt || undefined } },
        },
      };
    });
  };

  const setStock = (sec: string, material: string, qty: number) => {
    setState((prev) => {
      const s = prev[sec] ?? { steps: {}, stock: {} };
      return { ...prev, [sec]: { ...s, stock: { ...s.stock, [material]: qty } } };
    });
  };

  const setNote = (sec: string, note: string) => {
    setState((prev) => ({
      ...prev,
      [sec]: { ...(prev[sec] ?? { steps: {}, stock: {} }), note },
    }));
  };

  const toggleOpen = (sec: string) => {
    setState((prev) => ({
      ...prev,
      [sec]: {
        ...(prev[sec] ?? { steps: {}, stock: {} }),
        open: !(prev[sec]?.open ?? false),
      },
    }));
  };

  return (
    <div className="grid" style={{ marginTop: 18 }}>
      {sections.map((s) => {
        const secState = state[s.name] ?? { steps: {}, stock: {}, open: false };
        return (
          <section key={s.name} className="section">
            <button className="accordion__header" onClick={() => toggleOpen(s.name)} aria-expanded={secState.open}>
              <div className="accordion__title">{s.name}</div>
              <div className="accordion__meta">
                {s.types?.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
              <div className={`accordion__chev ${secState.open ? "open" : ""}`}>▾</div>
            </button>

            {secState.open && (
              <div className="accordion__content">
                <ul className="checklist">
                  {s.steps.map((step) => {
                    const st = secState.steps[step];
                    const checked = !!st?.checked;
                    const when = st?.when ?? "";
                    return (
                      <li key={step}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleStep(s.name, step, e.currentTarget.checked)}
                          aria-label={`Ολοκλήρωση: ${step}`}
                        />
                        <span style={{ flex: 1 }}>{step}</span>
                        <input
                          type="datetime-local"
                          value={when ? toLocal(when) : ""}
                          onChange={(e) => setDate(s.name, step, fromLocal(e.currentTarget.value))}
                          className="input"
                          title="Ημερομηνία/ώρα εργασίας"
                        />
                      </li>
                    );
                  })}
                </ul>

                {s.materials?.length ? (
                  <>
                    <div className="meta-row" style={{ marginTop: 8 }}>
                      <strong>Υλικά</strong>
                    </div>
                    <div className="table">
                      <div className="row head">
                        <div>Υλικό</div>
                        <div>Μονάδα</div>
                        <div>Stock</div>
                      </div>
                      {s.materials.map((m) => (
                        <div className="row" key={m.name}>
                          <div>{m.name}</div>
                          <div>{m.unit ?? "—"}</div>
                          <div>
                            {m.trackStock ? (
                              <input
                                type="number"
                                className="input"
                                value={secState.stock[m.name] ?? 0}
                                onChange={(e) => setStock(s.name, m.name, Number(e.currentTarget.value))}
                                min={0}
                                step={1}
                              />
                            ) : (
                              <span className="subtle">—</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                <div style={{ marginTop: 12 }}>
                  <label className="subtle" htmlFor={`note-${s.name}`}>
                    Σχόλια
                  </label>
                  <textarea
                    id={`note-${s.name}`}
                    className="textarea"
                    placeholder={s.comments ?? "Γράψε σχόλιο..."}
                    value={secState.note ?? ""}
                    onChange={(e) => setNote(s.name, e.currentTarget.value)}
                  />
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function toLocal(iso: string) {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}
function fromLocal(local: string) {
  if (!local) return "";
  const d = new Date(local);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() + tz).toISOString();
}
