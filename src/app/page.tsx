import { redirect } from "next/navigation";

export default function HomePage() {
  // No auth - go straight to trips
  redirect("/trips");
}
