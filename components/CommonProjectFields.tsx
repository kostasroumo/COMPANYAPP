"use client";

import { useEffect, useState } from "react";

type Props = {
  storageKey: string;
};

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

const FIELDS: Field[] = [
  { key: "address", label: "Address", placeholder: "e.g. Apo Konstaninou 18" },
  { key: "city", label: "City", placeholder: "e.g. D. Drama" },
  { key: "bid", label: "BID", placeholder: "e.g. 767229139" },
  { key: "srId", label: "SR ID", placeholder: "e.g. 678808" },
  { key: "cab", label: "Cab", placeholder: "e.g. G335" },
  { key: "admin", label: "Admin", multiline: true, placeholder: "Admin name(s)" },
  { key: "adminEmail", label: "Admin Email", placeholder: "admin@email.com" },
  { key: "adminPhone", label: "Admin Phone", placeholder: "Phone" },
  { key: "customerName", label: "Customer Name", multiline: true, placeholder: "Firstname / Lastname" },
  { key: "customerPhones", label: "Customer Phones", placeholder: "Phone / Mobile" },
  { key: "customerTax", label: "Customer Tax Number", placeholder: "AFM" },
  { key: "providerEmail", label: "Provider Email", placeholder: "provider@email.com" },
  { key: "customerFloor", label: "Customer Floor", placeholder: "0" },
];

export default function CommonProjectFields({ storageKey }: Props) {
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setValues(data);
      } catch {}
    }
  }, [mounted, storageKey]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(storageKey, JSON.stringify(values));
  }, [mounted, values, storageKey]);

  if (!mounted) return null;

  return (
    <section className="workorder">
      <div className="workorder__title">Workorder Info</div>

      <div className="workorder__grid">
        {FIELDS.map((f) => (
          <div key={f.key} className="workorder__card">
            <div className="workorder__label">{f.label}</div>
            {f.multiline ? (
              <textarea
                className="textarea"
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.currentTarget.value }))}
              />
            ) : (
              <input
                className="input"
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.currentTarget.value }))}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
