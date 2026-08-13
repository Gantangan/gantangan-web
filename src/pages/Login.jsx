import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState("peserta");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Isi email dan password.");
      return;
    }
    const res = await login({ email, password, expectedRole: role });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    showToast("ok", `Masuk sebagai ${res.user.nama}`);
    navigate(role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm p-6">
        <div className="mb-4 flex rounded-lg bg-cream p-1">
          <button
            type="button"
            onClick={() => setRole("peserta")}
            className={`flex-1 rounded-md py-2 text-xs font-semibold ${role === "peserta" ? "bg-ink text-cream" : "text-muted"}`}
          >
            Peserta
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 rounded-md py-2 text-xs font-semibold ${role === "admin" ? "bg-ink text-cream" : "text-muted"}`}
          >
            Admin
          </button>
        </div>

        <h1 className="font-display text-xl font-bold">{role === "admin" ? "Login Panitia" : "Masuk Akun"}</h1>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <p className="text-xs text-red-700">{error}</p>}

          <Button type="submit" variant="default" className="mt-1 w-full">
            {role === "admin" ? "Masuk sebagai Admin" : "Masuk"}
          </Button>
        </form>

        {role === "peserta" && (
          <p className="mt-4 text-center text-xs text-goldDeep">
            Belum punya akun?{" "}
            <Link to="/daftar" className="underline">
              Daftar
            </Link>
          </p>
        )}
        {role === "admin" && (
          <p className="mt-4 text-[11px] text-muted">Akun demo: admin@gantangan.id / admin123</p>
        )}
        <Link to="/" className="mt-4 block text-center text-xs text-muted underline">
          ← Kembali ke beranda
        </Link>
      </Card>
    </AuthLayout>
  );
}
