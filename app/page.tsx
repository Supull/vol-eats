import { redirect } from "next/navigation";

// /login forwards signed-in users straight to /today.
export default function Home() {
  redirect("/login");
}
