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
    pemilik: "", // nama peserta yang mengisi form (bisa beda dari nama akun)
    burung: "",
    namaPemilik: "", // nama pemilik burung, kalau beda dari pemesan
    alamat: "",
    catatan: "",
    hp: "",
    kodeBooking: null,
    bookedAt: null,
    kodeUnik: null,
    buktiTransfer: null,
    catatanTransfer: null,
    confirmedAt: null,
    hadir: false, // sudah check-in di lokasi (via scan QR)
    checkinAt: null,
  };
}

function emptyCategorySlots(count = SLOTS_PER_CATEGORY) {
  return Array.from({ length: count }, (_, i) => emptySlot(i + 1));
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
  const getDeskripsi = useCallback((catId) => categoryConfig[catId]?.deskripsi || "", [categoryConfig]);
  const getAutoImage = useCallback((catId) => categoryConfig[catId]?.autoImage || null, [categoryConfig]);
  const getTutupPendaftaran = useCallback((catId) => categoryConfig[catId]?.tutupPendaftaran || null, [categoryConfig]);
  const getSlotCount = useCallback(
    (catId) => categoryConfig[catId]?.slotCount ?? SLOTS_PER_CATEGORY,
    [categoryConfig]
  );
  const isBookingClosed = useCallback((catId) => checkClosed(getTutupPendaftaran(catId)), [getTutupPendaftaran]);

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

  function generateKodeBooking(boardState) {
    const year = new Date().getFullYear();
    let maxSeq = 0;
    Object.values(boardState).forEach((slots) => {
      (slots || []).forEach((s) => {
        if (s.kodeBooking) {
          const match = s.kodeBooking.match(/^GTG-(\d{4})-(\d+)$/);
          if (match && Number(match[1]) === year) maxSeq = Math.max(maxSeq, Number(match[2]));
        }
      });
    });
    return `GTG-${year}-${String(maxSeq + 1).padStart(5, "0")}`;
  }

  const bookSlot = useCallback(
    (catId, no, user, form) => {
      const idx = no - 1;
      if (board[catId][idx].status !== "kosong") return { ok: false, error: "Nomor ini baru saja diambil orang lain." };
      const next = { ...board };
      next[catId] = [...next[catId]];
      next[catId][idx] = {
        no,
        status: "pending",
        ownerEmail: user.email,
        pemilik: form.namaPeserta || user.nama,
        burung: form.burung,
        namaPemilik: form.namaPemilik || "",
        alamat: form.alamat || "",
        catatan: form.catatan || "",
        hp: form.whatsapp || user.hp,
        kodeBooking: generateKodeBooking(board),
        bookedAt: Date.now(),
        kodeUnik: generateKodeUnik(catId, board),
        buktiTransfer: null,
        catatanTransfer: null,
        confirmedAt: null,
      };
      persistBoard(next);
      return { ok: true, kodeBooking: next[catId][idx].kodeBooking };
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

  const resizeCategory = useCallback(
    (catId, newCount) => {
      const count = Math.max(1, Math.min(500, Math.floor(Number(newCount) || 0)));
      const current = board[catId] || [];
      if (count === current.length) return { ok: true };

      if (count > current.length) {
        // Tambah petak baru (kosong) di akhir
        const extra = Array.from({ length: count - current.length }, (_, i) => emptySlot(current.length + i + 1));
        const nextBoard = { ...board, [catId]: [...current, ...extra] };
        persistBoard(nextBoard);
      } else {
        // Mengurangi: hanya boleh kalau nomor yang mau dihapus semuanya masih kosong
        const toRemove = current.slice(count);
        const hasBooking = toRemove.some((s) => s.status !== "kosong");
        if (hasBooking) {
          return {
            ok: false,
            error: `Tidak bisa mengurangi — nomor ${count + 1} ke atas masih ada yang sudah dipesan. Kosongkan/batalkan dulu nomor itu.`,
          };
        }
        const nextBoard = { ...board, [catId]: current.slice(0, count) };
        persistBoard(nextBoard);
      }
      updateCategoryConfig(catId, { slotCount: count });
      return { ok: true };
    },
    [board, persistBoard, updateCategoryConfig]
  );

  const findBooking = useCallback(
    (query) => {
      const q = query.trim().toLowerCase();
      if (!q) return null;
      for (const c of categories) {
        const slots = board[c.id] || [];
        for (const s of slots) {
          if (s.status === "kosong") continue;
          const matchKode = s.kodeBooking && s.kodeBooking.toLowerCase() === q;
          const matchHp = s.hp && s.hp.replace(/[^0-9]/g, "") === q.replace(/[^0-9]/g, "") && q.replace(/[^0-9]/g, "").length >= 8;
          if (matchKode || matchHp) return { ...s, catId: c.id, catName: c.name, harga: getHarga(c.id) };
        }
      }
      return null;
    },
    [categories, board, getHarga]
  );

  const markHadir = useCallback(
    (catId, no) => {
      const idx = no - 1;
      if (!board[catId] || !board[catId][idx]) return { ok: false, error: "Data tidak ditemukan." };
      const next = { ...board };
      next[catId] = [...next[catId]];
      next[catId][idx] = { ...next[catId][idx], hadir: true, checkinAt: Date.now() };
      persistBoard(next);
      return { ok: true };
    },
    [board, persistBoard]
  );

  return (
    <BookingContext.Provider
      value={{
        categories,
        board,
        loaded,
        getHarga,
        getJadwal,
        getDeskripsi,
        getAutoImage,
        getTutupPendaftaran,
        getSlotCount,
        isBookingClosed,
        bookSlot,
        submitBukti,
        setSlotStatus,
        addCategory,
        renameCategory,
        removeCategory,
        resizeCategory,
        updateCategoryConfig,
        findBooking,
        markHadir,
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
