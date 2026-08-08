import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/services/storage";

const AuthContext = createContext(null);

const DEFAULT_ADMIN_EMAIL = "admin@gantangan.id";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function randomSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Browser sungguhan (bukan sandbox artifact) jadi aman pakai Web Crypto asli.
async function hashPassword(password, salt) {
  const enc = new TextEncoder().encode(salt + ":" + password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      let loadedUsers = (await getItem("users", null)) || {};
      if (!loadedUsers[DEFAULT_ADMIN_EMAIL]) {
        const salt = randomSalt();
        const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD, salt);
        loadedUsers[DEFAULT_ADMIN_EMAIL] = { nama: "Panitia", hp: "-", salt, passwordHash, role: "admin" };
        await setItem("users", loadedUsers);
      }
      setUsers(loadedUsers);
      const savedSession = await getItem("session", null);
      if (savedSession && loadedUsers[savedSession]) {
        const acct = loadedUsers[savedSession];
        setCurrentUser({ email: savedSession, nama: acct.nama, hp: acct.hp, role: acct.role });
      }
      setLoaded(true);
    })();
  }, []);

  const register = useCallback(
    async ({ nama, email, hp, password }) => {
      const key = email.trim().toLowerCase();
      if (users[key]) return { ok: false, error: "Email sudah terdaftar. Silakan login." };
      const salt = randomSalt();
      const passwordHash = await hashPassword(password, salt);
      const nextUsers = { ...users, [key]: { nama: nama.trim(), hp: hp.trim(), salt, passwordHash, role: "peserta" } };
      setUsers(nextUsers);
      await setItem("users", nextUsers);
      const user = { email: key, nama: nama.trim(), hp: hp.trim(), role: "peserta" };
      setCurrentUser(user);
      await setItem("session", key);
      return { ok: true, user };
    },
    [users]
  );

  const login = useCallback(
    async ({ email, password, expectedRole }) => {
      const key = email.trim().toLowerCase();
      const acct = users[key];
      if (!acct) return { ok: false, error: "Email belum terdaftar." };
      if (expectedRole && acct.role !== expectedRole) {
        return { ok: false, error: expectedRole === "admin" ? "Akun ini bukan akun admin." : "Gunakan tab Admin untuk akun ini." };
      }
      const hash = await hashPassword(password, acct.salt);
      if (hash !== acct.passwordHash) return { ok: false, error: "Password salah." };
      const user = { email: key, nama: acct.nama, hp: acct.hp, role: acct.role };
      setCurrentUser(user);
      await setItem("session", key);
      return { ok: true, user };
    },
    [users]
  );

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await setItem("session", null);
  }, []);

  const updateProfile = useCallback(
    async ({ nama, hp }) => {
      if (!currentUser) return;
      const nextUsers = { ...users, [currentUser.email]: { ...users[currentUser.email], nama, hp } };
      setUsers(nextUsers);
      await setItem("users", nextUsers);
      setCurrentUser({ ...currentUser, nama, hp });
    },
    [currentUser, users]
  );

  const changePassword = useCallback(
    async ({ lama, baru }) => {
      if (!currentUser) return { ok: false, error: "Belum login." };
      const acct = users[currentUser.email];
      const hashLama = await hashPassword(lama, acct.salt);
      if (hashLama !== acct.passwordHash) return { ok: false, error: "Password lama salah." };
      const salt = randomSalt();
      const passwordHash = await hashPassword(baru, salt);
      const nextUsers = { ...users, [currentUser.email]: { ...acct, salt, passwordHash } };
      setUsers(nextUsers);
      await setItem("users", nextUsers);
      return { ok: true };
    },
    [currentUser, users]
  );

  return (
    <AuthContext.Provider value={{ users, currentUser, loaded, register, login, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
