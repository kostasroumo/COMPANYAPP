"use client";
import Link from "next/link";
import styles from "./ActivityCard.module.css";

type Action = { href: string; label: string; variant?: "solid" | "ghost" };

type Props = {
  title: string;
  actions?: Action[];
};

export default function ActivityCard({ title, actions = [] }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`${styles.chip} ${a.variant === "ghost" ? styles.ghost : ""}`}
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
