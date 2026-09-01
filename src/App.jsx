import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth.jsx";
import { BookingProvider } from "@/hooks/useBooking";
import { SettingsProvider } from "@/hooks/useSettings";
import { PostsProvider } from "@/hooks/usePosts";
import { PhotosProvider } from "@/hooks/usePhotos";
import { ToastProvider } from "@/components/Toast";

// Lazy-load semua halaman: tiap rute baru diunduh browser saat benar-benar
// dibuka, bukan sekaligus di awal. Peserta tidak perlu download kode Admin
// (chart, laporan, dsb), dan sebaliknya — mempercepat loading pertama.
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Booking = lazy(() => import("@/pages/Booking"));
const CekPesanan = lazy(() => import("@/pages/CekPesanan"));
const Berita = lazy(() => import("@/pages/Berita"));
const BeritaDetail = lazy(() => import("@/pages/BeritaDetail"));
const Galeri = lazy(() => import("@/pages/Galeri"));
const Riwayat = lazy(() => import("@/pages/Riwayat"));
const Settings = lazy(() => import("@/pages/Settings"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminDashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const AdminBooking = lazy(() => import("@/pages/Admin/Booking"));
const AdminScan = lazy(() => import("@/pages/Admin/Scan"));
const AdminKategori = lazy(() => import("@/pages/Admin/Kategori"));
const AdminPeserta = lazy(() => import("@/pages/Admin/Peserta"));
const AdminPembayaran = lazy(() => import("@/pages/Admin/Pembayaran"));
const AdminLaporan = lazy(() => import("@/pages/Admin/Laporan"));
const AdminPengaturan = lazy(() => import("@/pages/Admin/Pengaturan"));
const AdminPostingan = lazy(() => import("@/pages/Admin/Postingan"));
const AdminGaleri = lazy(() => import("@/pages/Admin/Galeri"));

function PrivateRoute({ children, role }) {
  const { currentUser, loaded } = useAuth();
  if (!loaded) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <SettingsProvider>
          <PostsProvider>
          <PhotosProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/daftar" element={<Register />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/cek-pesanan" element={<CekPesanan />} />
                <Route path="/berita" element={<Berita />} />
                <Route path="/berita/:id" element={<BeritaDetail />} />
                <Route path="/galeri" element={<Galeri />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute role="peserta">
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/riwayat"
                  element={
                    <PrivateRoute role="peserta">
                      <Riwayat />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profil"
                  element={
                    <PrivateRoute role="peserta">
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute role="admin">
                      <Admin />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="booking" element={<AdminBooking />} />
                  <Route path="scan" element={<AdminScan />} />
                  <Route path="kategori" element={<AdminKategori />} />
                  <Route path="peserta" element={<AdminPeserta />} />
                  <Route path="pembayaran" element={<AdminPembayaran />} />
                  <Route path="laporan" element={<AdminLaporan />} />
                  <Route path="pengaturan" element={<AdminPengaturan />} />
                  <Route path="postingan" element={<AdminPostingan />} />
                  <Route path="galeri" element={<AdminGaleri />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
          </PhotosProvider>
          </PostsProvider>
        </SettingsProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
