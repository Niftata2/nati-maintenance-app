import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "OWNER") redirect("/manager");
  if (role === "CASHIER") redirect("/pos");
  if (role === "TECHNICIAN") redirect("/my-jobs");

  redirect("/login");
}