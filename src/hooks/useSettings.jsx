import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/services/storage";

const SettingsContext = createContext(null);

export const DEFAULT_HEADER_COLOR = "#2A2620";

export function SettingsProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [logo, setLogoState] = useState(null); // data URL gambar logo, atau null kalau belum diatur
  const [headerColor, setHeaderColorState] = useState(DEFAULT_HEADER_COLOR);
  const [heroImage, setHeroImageState] = useState(null);
  const [contactWhatsapp, setContactWhatsappState] = useState("");
  const [pexelsApiKey, setPexelsApiKeyState] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setAnnouncements((await getItem("announcements", null)) || []);
      setPaymentAccounts((await getItem("paymentAccounts", null)) || []);
      setLogoState((await getItem("logo", null)) || null);
      setHeaderColorState((await getItem("headerColor", null)) || DEFAULT_HEADER_COLOR);
      setHeroImageState((await getItem("heroImage", null)) || null);
      setContactWhatsappState((await getItem("contactWhatsapp", null)) || "");
      setPexelsApiKeyState((await getItem("pexelsApiKey", null)) || "");
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

  const setHeaderColor = useCallback((hex) => {
    setHeaderColorState(hex);
    setItem("headerColor", hex);
  }, []);

  const resetHeaderColor = useCallback(() => {
    setHeaderColorState(DEFAULT_HEADER_COLOR);
    setItem("headerColor", DEFAULT_HEADER_COLOR);
  }, []);

  const setHeroImage = useCallback(async (dataUrl) => {
    setHeroImageState(dataUrl);
    const ok = await setItem("heroImage", dataUrl);
    if (!ok) setHeroImageState((await getItem("heroImage", null)) || null);
    return ok;
  }, []);

  const removeHeroImage = useCallback(() => {
    setHeroImageState(null);
    setItem("heroImage", null);
  }, []);

  const setContactWhatsapp = useCallback((value) => {
    setContactWhatsappState(value);
    setItem("contactWhatsapp", value);
  }, []);

  const setPexelsApiKey = useCallback((value) => {
    setPexelsApiKeyState(value);
    setItem("pexelsApiKey", value);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        announcements,
        paymentAccounts,
        logo,
        headerColor,
        heroImage,
        contactWhatsapp,
        pexelsApiKey,
        loaded,
        addAnnouncement,
        removeAnnouncement,
        addAccount,
        removeAccount,
        setLogo,
        removeLogo,
        setHeaderColor,
        resetHeaderColor,
        setHeroImage,
        removeHeroImage,
        setContactWhatsapp,
        setPexelsApiKey,
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
