import { redirect } from "next/navigation";

export default function ProjectsPage() {
  // Δεν υπάρχει πλέον αρχική λίστα έργων· πάμε κατευθείαν στο default contract.
  redirect("/projects/default");
}
