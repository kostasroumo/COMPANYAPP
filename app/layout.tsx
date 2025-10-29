// app/layout.tsx
import "./styles/base.css"; // <— ΣΗΜΑΝΤΙΚΟ: να φορτώνει τα tokens/base παντού
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}
