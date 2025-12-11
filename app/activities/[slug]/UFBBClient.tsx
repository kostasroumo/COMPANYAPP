"use client";

import { useEffect, useState } from "react";

type Material = { name: string; unit?: string; trackStock?: boolean };
type Section = {
  name: string;
  types?: string[];     // π.χ. ["Access","Backhaul"] ή ["Καμπίνα F1","Καμπίνα F2","Καμπίνα C3"]
  steps: string[];
  materials?: Material[];
  comments?: string;
};

type Props = { sections: Section[]; storageKey?: string };

type StepState = { checked: boolean; when?: string }; // ISO datetime
type SectionState = {
  steps: Record<string, StepState>; // key = step title
  stock: Record<string, number>;    // key = material name
  units: Record<string, string>;    // 🔴 ΝΕΟ: μονάδες ανά υλικό
  note?: string;
  open?: boolean;                   // χρησιμοποιούμε το open για modal visible
  selectedType?: string;            // επιλεγμένος τύπος ενότητας
};

export default function UFBBClient({ sections, storageKey = "ufbb-state" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<Record<string, SectionState>>({});

  // αποφυγή SSR/CSR mismatch
  useEffect(() => { setMounted(true); }, []);

  // load
  useEffect(() => {
    if (!mounted) return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try { setState(JSON.parse(raw)); } catch {}
    }
  }, [mounted, storageKey]);

  // save
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [mounted, state, storageKey]);

  if (!mounted) return null;

  const toggleStep = (sec: string, step: string, next: boolean) => {
    setState(prev => {
      const s: SectionState = prev[sec] ?? { steps: {}, stock: {}, units: {} };
      const current = s.steps[step] ?? { checked: false };
      return {
        ...prev,
        [sec]: {
          ...s,
          steps: {
            ...s.steps,
            [step]: {
              checked: next,
              when: next ? (current.when ?? new Date().toISOString()) : undefined
            }
          }
        }
      };
    });
  };

  const setDate = (sec: string, step: string, dt: string) => {
    setState(prev => {
      const s: SectionState = prev[sec] ?? { steps: {}, stock: {}, units: {} };
      const current = s.steps[step] ?? { checked: false };
      return {
        ...prev,
        [sec]: {
          ...s,
          steps: {
            ...s.steps,
            [step]: { ...current, when: dt || undefined }
          }
        }
      };
    });
  };

  const setStock = (sec: string, material: string, qty: number) => {
    setState(prev => {
      const s: SectionState = prev[sec] ?? { steps: {}, stock: {}, units: {} };
      return {
        ...prev,
        [sec]: {
          ...s,
          stock: { ...s.stock, [material]: qty }
        }
      };
    });
  };

  const setUnit = (sec: string, material: string, unit: string) => {
    setState(prev => {
      const s: SectionState = prev[sec] ?? { steps: {}, stock: {}, units: {} };
      return {
        ...prev,
        [sec]: {
          ...s,
          units: {
            ...s.units,
            [material]: unit,
          },
        },
      };
    });
  };

  const setNote = (sec: string, note: string) => {
    setState(prev => ({
      ...prev,
      [sec]: {
        ...(prev[sec] ?? { steps: {}, stock: {}, units: {} }),
        note
      }
    }));
  };

  const openModal = (sec: string) => {
    setState(prev => ({
      ...prev,
      [sec]: {
        ...(prev[sec] ?? { steps: {}, stock: {}, units: {} }),
        open: true
      }
    }));
    // προαιρετικό: lock scroll στο σώμα
    document.body.style.overflow = "hidden";
  };
  const closeModal = (sec: string) => {
    setState(prev => ({
      ...prev,
      [sec]: {
        ...(prev[sec] ?? { steps: {}, stock: {}, units: {} }),
        open: false
      }
    }));
    document.body.style.overflow = "";
  };

  // Επιλογή τύπου με κλικ στο badge (χωρίς αλλαγή UI)
  const setType = (sec: string, type: string) => {
    setState(prev => {
      const s: SectionState = prev[sec] ?? { steps: {}, stock: {}, units: {} };
      const nextSelected = s.selectedType === type ? undefined : type; // ξανακλικ στο ίδιο → καθαρίζει
      return { ...prev, [sec]: { ...s, selectedType: nextSelected } };
    });
  };

  // === Section modal content ===
  const renderSectionBody = (s: Section, secState: SectionState) => (
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
                onChange={e => toggleStep(s.name, step, e.currentTarget.checked)}
                aria-label={`Ολοκλήρωση: ${step}`}
              />
              <span style={{ flex: 1 }}>{step}</span>
              <input
                type="datetime-local"
                value={when ? toLocal(when) : ""}
                onChange={e => setDate(s.name, step, fromLocal(e.currentTarget.value))}
                className="input"
                title="Ημερομηνία/ώρα εργασίας"
              />
            </li>
          );
        })}
      </ul>

      {s.materials?.length ? (
        <>
          <div className="meta-row" style={{ marginTop: 8 }}><strong>Υλικά</strong></div>
          <div className="table">
            <div className="row head">
              <div>Υλικό</div><div>Μονάδα</div><div>Stock</div>
            </div>
            {s.materials.map(m => {
              const unitFromState = secState.units?.[m.name] ?? "";
              const displayUnit = unitFromState || m.unit || "";

              // 🔑 Λογική για stock:
              // - Αν ΔΕΝ έχει unit στο JSON -> ΠΑΝΤΑ stock
              // - Αν έχει unit -> μόνο όταν trackStock = true (όπως πριν)
              const hasStock = m.trackStock || !m.unit;

              return (
                <div className="row" key={m.name}>
                  <div>{m.name}</div>
                  <div>
                    {m.unit ? (
                      // αν έχει unit στο ufbb.json, το δείχνουμε ως κείμενο (όπως πριν)
                      <span>{displayUnit}</span>
                    ) : (
                      // αν ΔΕΝ έχει unit, δίνουμε input στον χρήστη
                      <input
                        type="text"
                        className="input"
                        placeholder="μονάδα (π.χ. m, τεμ)"
                        style={{ maxWidth: 90 }}
                        value={displayUnit}
                        onChange={e =>
                          setUnit(s.name, m.name, e.currentTarget.value)
                        }
                      />
                    )}
                  </div>
                  <div>
                    {hasStock ? (
                      <input
                        type="number"
                        className="input"
                        value={secState.stock[m.name] ?? 0}
                        onChange={e => setStock(s.name, m.name, Number(e.currentTarget.value))}
                        min={0}
                        step={1}
                      />
                    ) : (
                      <span className="subtle">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <label className="subtle" htmlFor={`note-${s.name}`}>Σχόλια</label>
        <textarea
          id={`note-${s.name}`}
          className="textarea"
          placeholder={s.comments ?? "Γράψε σχόλιο..."}
          value={secState.note ?? ""}
          onChange={e => setNote(s.name, e.currentTarget.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="grid" style={{ marginTop: 18 }}>
      {sections.map((s) => {
        const secState: SectionState = state[s.name] ?? { steps: {}, stock: {}, units: {}, open: false };

        return (
          <section key={s.name} className="section">
            {/* Δεν αλλάζουμε UI: το header φαίνεται ίδιο, απλώς ανοίγει modal */}
            <div
              className="accordion__header"
              role="button"
              tabIndex={0}
              aria-expanded={false}
              onClick={() => openModal(s.name)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openModal(s.name)}
            >
              <div className="accordion__title">{s.name}</div>

              {/* ίδια badges, clickable για επιλογή τύπου */}
              <div
                className="accordion__meta"
                onClick={(e) => e.stopPropagation()}
              >
                {s.types?.map(t => (
                  <span
                    key={t}
                    role="button"
                    tabIndex={0}
                    className="badge"
                    aria-pressed={secState.selectedType === t}
                    onClick={() => setType(s.name, t)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setType(s.name, t)}
                    title={secState.selectedType === t ? "Απενεργοποίηση" : "Επιλογή"}
                  >
                    {t}{secState.selectedType === t ? " ✓" : ""}
                  </span>
                ))}
              </div>

              <div className="accordion__chev">↗</div>
            </div>

            {/* Modal */}
            {secState.open && (
              <div className="modal-backdrop" onMouseDown={() => closeModal(s.name)}>
                <div
                  className="modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`modal-${s.name}`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h2 id={`modal-${s.name}`} className="section-title" style={{ margin: 0 }}>{s.name}</h2>
                    <div className="modal-actions">
                      {/* badges και εδώ (ώστε να είναι διαθέσιμα μέσα στο modal) */}
                      <div className="accordion__meta">
                        {s.types?.map(t => (
                          <span
                            key={t}
                            role="button"
                            tabIndex={0}
                            className="badge"
                            aria-pressed={secState.selectedType === t}
                            onClick={() => setType(s.name, t)}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setType(s.name, t)}
                            title={secState.selectedType === t ? "Απενεργοποίηση" : "Επιλογή"}
                          >
                            {t}{secState.selectedType === t ? " ✓" : ""}
                          </span>
                        ))}
                      </div>
                      <button className="modal-close" type="button" onClick={() => closeModal(s.name)} aria-label="Κλείσιμο">×</button>
                    </div>
                  </div>

                  <div className="modal-body">
                    {renderSectionBody(s, secState)}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="badge" onClick={() => closeModal(s.name)}>Κλείσιμο</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/* helpers για datetime-local <-> ISO */
function toLocal(iso: string) {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0,16);
}
function fromLocal(local: string) {
  if (!local) return "";
  const d = new Date(local);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() + tz).toISOString();
}
