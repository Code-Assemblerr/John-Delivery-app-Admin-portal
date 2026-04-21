import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function RootPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.role === "vendor") redirect("/vendor");
  redirect("/login");
}
