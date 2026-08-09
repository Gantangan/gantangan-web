import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/services/storage";
import { DEFAULT_CATEGORIES, SLOTS_PER_CATEGORY, HOLD_MS, HARGA_DASAR } from "@/constants";
import { isBookingClosed as checkClosed } from "@/utils/date";

const BookingContext = createContext(null);

function emptySlot(no) {
  return {
    no,
    status: "kosong",
    ownerEmail: null,
    pemilik: "",
    burung: "",
    hp: "",
    bookedAt: null,
    kodeUnik: null,
    buktiTransfer: null,
    catatanTransfer: null,
    confirmedAt: null,
  };
}

function emptyCategorySlots() {
  return Array.from({ length: SLOTS_PER_CATEGORY }, (_, i) => emptySlot(i + 1));
}

export function BookingProvider({ children }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [categoryConfig, setCategoryConfig] = useState({});
  const [board, setBoard] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const loadedCategories = (await getItem("categories", null)) || DEFAULT_CATEGORIES;
      setCategories(loadedCategories);
      const loadedConfig = (await getItem("categoryConfig", null)) || {};
      setCategoryConfig(loadedConfig);
      let loadedBoard = (await getItem("board", null)) || {};
      loadedCategories.forEach((c) => {
        if (!loadedBoard[c.id]) loadedBoard[c.id] = emptyCategorySlots();
      });
      setBoard(loadedBoard);
      setLoaded(true);
    })();
  }, []);

  // auto-release nomor pending yang lewat 15 menit
  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      setBoard((prev) => {
        let changed = false;
        const next = { ...prev };
        categories.forEach((c) => {
          next[c.id] = (next[c.id] || []).map((slot) => {
            if (slot.status === "pending" && slot.bookedAt && Date.now() - slot.bookedAt > HOLD_MS) {
              changed = true;
              return emptySlot(slot.no);
            }
            return slot;
          });
        });
        if (changed) setItem("board", next);
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [loaded, categories]);

  const getHarga = useCallback((catId) => categoryConfig[catId]?.harga ?? HARGA_DASAR, [categoryConfig]);
  const getJadwal = useCallback((catId) => categoryConfig[catId]?.jadwal || null, [categoryConfig]);
  const isBookingClosed = useCallback((catId) => checkClosed(getJadwal(catId)), [getJadwal]);

  const persistBoard = useCallback((next) => {
    setBoard(next);
    setItem("board", next);
  }, []);

  function generateKodeUnik(catId, boardState) {
    const used = new Set((boardState[catId] || []).filter((s) => s.kodeUnik != null).map((s) => s.kodeUnik));
    let code;
    do {
      code = Math.floor(Math.random() * 899) + 100;
    } while (used.has(code));
    return code;
  }

  const bookSlot = useCallback(
    (catId, no, user, burung) => {
      const idx = no - 1;
      if (board[catId][idx].status !== "kosong") return { ok: false, error: "Nomor ini baru saja diambil orang lain." };
      const next = { ...board };
      next[catId] = [...next[catId]];
      next[catId][idx] = {
        no,
        status: "pending",
        ownerEmail: user.email,
        pemilik: user.nama,
        burung,
        hp: user.hp,
        bookedAt: Date.now(),
        kodeUnik: generateKodeUnik(catId, board),
        buktiTransfer: null,
        catatanTransfer: null,
        confirmedAt: null,
      };
      persistBoard(next);
      return { ok: true };
    },
    [board, persistBoard]
  );

  const submitBukti = useCallback(
    (catId, no, { buktiTransfer, catatanTransfer }) => {
      const idx = no - 1;
      const next = { ...board };
      next[catId] = [...next[catId]];
      next[catId][idx] = { ...next[catId][idx], status: "verifikasi", buktiTransfer: buktiTransfer || null, catatanTransfer: catatanTransfer || null };
      persistBoard(next);
    },
    [board, persistBoard]
  );

  const setSlotStatus = useCallback(
    (catId, no, status) => {
      const idx = no - 1;
      const next = { ...board };
      next[catId] = [...next[catId]];
      if (status === "kosong") next[catId][idx] = emptySlot(no);
      else if (status === "terkunci") next[catId][idx] = { ...next[catId][idx], status, confirmedAt: Date.now() };
      else next[catId][idx] = { ...next[catId][idx], status };
      persistBoard(next);
      return next[catId][idx];
    },
    [board, persistBoard]
  );

  const addCategory = useCallback(
    (name) => {
      const id = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "kategori";
      const finalId = categories.some((c) => c.id === id) ? id + "-" + Date.now().toString(36).slice(-4) : id;
      const color = ["#8B4513", "#1F2937", "#16A34A", "#166534", "#B8860B", "#7C3AED"][categories.length % 6];
      const nextCategories = [...categories, { id: finalId, name: name.trim(), tagColor: color }];
      setCategories(nextCategories);
      setItem("categories", nextCategories);
      const nextBoard = { ...board, [finalId]: emptyCategorySlots() };
      persistBoard(nextBoard);
    },
    [categories, board, persistBoard]
  );

  const updateCategoryConfig = useCallback(
    (catId, patch) => {
      const next = { ...categoryConfig, [catId]: { ...categoryConfig[catId], ...patch } };
      setCategoryConfig(next);
      setItem("categoryConfig", next);
    },
    [categoryConfig]
  );

  const renameCategory = useCallback(
    (catId, newName) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      const next = categories.map((c) => (c.id === catId ? { ...c, name: trimmed } : c));
      setCategories(next);
      setItem("categories", next);
    },
    [categories]
  );

  const removeCategory = useCallback(
    (catId) => {
      const hasBooking = (board[catId] || []).some((s) => s.status !== "kosong");
      if (hasBooking) return { ok: false, error: "Kategori ini masih punya pendaftaran aktif, tidak bisa dihapus." };
      const next = categories.filter((c) => c.id !== catId);
      setCategories(next);
      setItem("categories", next);
      const nextBoard = { ...board };
      delete nextBoard[catId];
      persistBoard(nextBoard);
      return { ok: true };
    },
    [categories, board, persistBoard]
  );

  return (
    <BookingContext.Provider
      value={{
        categories,
        board,
        loaded,
        getHarga,
        getJadwal,
        isBookingClosed,
        bookSlot,
        submitBukti,
        setSlotStatus,
        addCategory,
        renameCategory,
        removeCategory,
        updateCategoryConfig,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking harus dipakai di dalam <BookingProvider>");
  return ctx;
}
