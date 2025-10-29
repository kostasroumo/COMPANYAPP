import { PropsWithChildren } from "react";

export default function SectionGrid({ children }: PropsWithChildren) {
  return <div className="grid">{children}</div>;
}
