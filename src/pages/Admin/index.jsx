import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Ticker from "@/components/Ticker";
import { useSettings } from "@/hooks/useSettings";

export default function Admin() {
  const { announcements } = useSettings();
  return (
    <div className="flex min-h-screen flex-col bg-cream md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Ticker items={announcements} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
