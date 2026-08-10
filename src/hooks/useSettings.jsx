import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/services/storage";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [logo, setLogoState] = useState(null); // data URL gambar logo, atau null kalau belum diatur
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setAnnouncements((await getItem("announcements", null)) || []);
      setPaymentAccounts((await getItem("paymentAccounts", null)) || []);
      setLogoState((await getItem("logo", null)) || null);
      setLoaded(true);
    })();
  }, []);

  const addAnnouncement = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const next = [...announcements, { id: Date.now().toString(36), text: trimmed }];
      setAnnouncements(next);
      setItem("announcements", next);
    },
    [announcements]
  );

  const removeAnnouncement = useCallback(
    (id) => {
      const next = announcements.filter((a) => a.id !== id);
      setAnnouncements(next);
      setItem("announcements", next);
    },
    [announcements]
  );

  const addAccount = useCallback(
    (account) => {
      const next = [...paymentAccounts, { id: Date.now().toString(36), ...account }];
      setPaymentAccounts(next);
      setItem("paymentAccounts", next);
    },
    [paymentAccounts]
  );

  const removeAccount = useCallback(
    (id) => {
      const next = paymentAccounts.filter((a) => a.id !== id);
      setPaymentAccounts(next);
      setItem("paymentAccounts", next);
    },
    [paymentAccounts]
  );

  const setLogo = useCallback(async (dataUrl) => {
    setLogoState(dataUrl);
    const ok = await setItem("logo", dataUrl);
    if (!ok) setLogoState((await getItem("logo", null)) || null); // rollback tampilan kalau gagal simpan
    return ok;
  }, []);

  const removeLogo = useCallback(() => {
    setLogoState(null);
    setItem("logo", null);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        announcements,
        paymentAccounts,
        logo,
        loaded,
        addAnnouncement,
        removeAnnouncement,
        addAccount,
        removeAccount,
        setLogo,
        removeLogo,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings harus dipakai di dalam <SettingsProvider>");
  return ctx;
}
