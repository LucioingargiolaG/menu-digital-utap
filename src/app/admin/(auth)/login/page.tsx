import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin · Utap" };

// Siempre dinámico: lee la cookie de sesión
export const dynamic = "force-dynamic";

// Página de login: si ya hay sesión, directo al panel
export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <LoginForm />
    </div>
  );
}
