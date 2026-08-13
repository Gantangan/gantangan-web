import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const { register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: "", email: "", hp: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nama.trim() || !form.hp.trim() || !form.email.trim() || !form.password) {
      setError("Lengkapi semua data dulu.");
      return;
    }
    const res = await register(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    showToast("ok", `Selamat datang, ${res.user.nama}!`);
    navigate("/dashboard");
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm p-6">
        <h1 className="font-display text-xl font-bold">Daftar Akun Peserta</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Nama Lengkap</label>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama kamu" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">No. HP</label>
            <Input value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} placeholder="08xx-xxxx-xxxx" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Password</label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>

          {error && <p className="text-xs text-red-700">{error}</p>}

          <Button type="submit" className="mt-1 w-full">
            Daftar
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-goldDeep">
          Sudah punya akun?{" "}
          <Link to="/login" className="underline">
            Masuk
          </Link>
        </p>
        <Link to="/" className="mt-4 block text-center text-xs text-muted underline">
          ← Kembali ke beranda
        </Link>
      </Card>
    </AuthLayout>
  );
}
