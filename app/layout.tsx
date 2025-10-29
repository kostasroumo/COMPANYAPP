// app/layout.tsx
import type { ReactNode } from "react";

export const metadata = {
  title: "Δραστηριότητες & Συμβάσεις",
  description: "Hub έργων (UFBB κ.ά.)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="el">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
