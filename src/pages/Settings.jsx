import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/Toast";

export default function Settings() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const showToast = useToast();

  const [profile, setProfile] = useState({ nama: currentUser?.nama || "", hp: currentUser?.hp || "" });
  const [pass, setPass] = useState({ lama: "", baru: "" });

  function handleSaveProfile() {
    updateProfile({ nama: profile.nama.trim() || currentUser.nama, hp: profile.hp.trim() || currentUser.hp });
    showToast("ok", "Profil berhasil diperbarui.");
  }

  async function handleChangePassword() {
    if (!pass.lama || !pass.baru) {
      showToast("error", "Isi password lama dan baru.");
      return;
    }
    const res = await changePassword(pass);
    if (!res.ok) {
      showToast("error", res.error);
      return;
    }
    setPass({ lama: "", baru: "" });
    showToast("ok", "Password berhasil diganti.");
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header
        subtitle="Profil Saya"
        actions={
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="border-inkSoft text-cream">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Dashboard
            </Button>
          </Link>
        }
      />
      <main className="px-5 py-8">
        <h1 className="font-display text-2xl font-bold">Profil Saya</h1>

        <Card className="mt-5">
          <CardHeader>
            <CardTitle>Data Diri</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Nama Lengkap</label>
              <Input value={profile.nama} onChange={(e) => setProfile({ ...profile, nama: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">No. HP</label>
              <Input value={profile.hp} onChange={(e) => setProfile({ ...profile, hp: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Email</label>
              <Input value={currentUser?.email || ""} disabled />
              <p className="mt-1 text-[11px] text-muted">Email tidak bisa diubah karena dipakai untuk login.</p>
            </div>
            <Button onClick={handleSaveProfile} className="mt-1 self-start">
              Simpan Profil
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Ganti Password</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Password Lama</label>
              <Input type="password" value={pass.lama} onChange={(e) => setPass({ ...pass, lama: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Password Baru</label>
              <Input type="password" value={pass.baru} onChange={(e) => setPass({ ...pass, baru: e.target.value })} />
            </div>
            <Button onClick={handleChangePassword} className="mt-1 self-start">
              Ganti Password
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
