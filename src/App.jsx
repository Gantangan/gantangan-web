import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth.jsx";
import { BookingProvider } from "@/hooks/useBooking";
import { SettingsProvider } from "@/hooks/useSettings";
import { ToastProvider } from "@/components/Toast";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Booking from "@/pages/Booking";
import Riwayat from "@/pages/Riwayat";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/Admin/Dashboard";
import AdminBooking from "@/pages/Admin/Booking";
import AdminKategori from "@/pages/Admin/Kategori";
import AdminPeserta from "@/pages/Admin/Peserta";
import AdminPembayaran from "@/pages/Admin/Pembayaran";
import AdminLaporan from "@/pages/Admin/Laporan";
import AdminPengaturan from "@/pages/Admin/Pengaturan";

function PrivateRoute({ children, role }) {
  const { currentUser, loaded } = useAuth();
  if (!loaded) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <SettingsProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/daftar" element={<Register />} />
                <Route path="/booking" element={<Booking />} />
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
                  <Route path="kategori" element={<AdminKategori />} />
                  <Route path="peserta" element={<AdminPeserta />} />
                  <Route path="pembayaran" element={<AdminPembayaran />} />
                  <Route path="laporan" element={<AdminLaporan />} />
                  <Route path="pengaturan" element={<AdminPengaturan />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </SettingsProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
