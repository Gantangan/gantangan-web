// src/services/payment.js
//
// Abstraksi pemanggilan payment gateway (Midtrans Snap).
//
// PENTING — cara kerja & apa yang masih perlu disiapkan:
// 1. Frontend (file ini) HANYA boleh pakai "Client Key" Midtrans (aman untuk publik).
// 2. "Server Key" Midtrans WAJIB disimpan di backend (Supabase Edge Function),
//    JANGAN PERNAH ditaruh di kode frontend — itu kunci rahasia yang bisa dipakai
//    orang lain untuk membuat transaksi atas nama akun Midtrans kamu.
// 3. Endpoint `createTransaction()` di bawah ini memanggil backend (bukan Midtrans
//    langsung) — backend itulah yang benar-benar bicara ke Midtrans pakai Server Key.
// 4. Contoh kode Edge Function-nya sudah saya siapkan di:
//      supabase/functions/create-transaction/index.ts
//      supabase/functions/midtrans-webhook/index.ts
//    Tinggal di-deploy pakai `supabase functions deploy` begitu Supabase aktif.
//
// Status saat ini: BELUM AKTIF. Endpoint di bawah masih menunjuk ke placeholder,
// jadi memanggilnya sekarang akan gagal dengan pesan yang jelas (bukan diam-diam
// error). Setelah Supabase & Edge Function siap, cukup isi VITE_API_BASE_URL di
// file .env dan alur ini langsung berfungsi tanpa ubah kode lain.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_ENV = import.meta.env.VITE_MIDTRANS_ENV || "sandbox"; // "sandbox" | "production"

export function isPaymentGatewayConfigured() {
  return Boolean(API_BASE_URL && MIDTRANS_CLIENT_KEY);
}

function snapJsUrl() {
  return MIDTRANS_ENV === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

let snapScriptPromise = null;
function loadSnapScript() {
  if (window.snap) return Promise.resolve();
  if (snapScriptPromise) return snapScriptPromise;
  snapScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = snapJsUrl();
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Snap.js dari Midtrans."));
    document.body.appendChild(script);
  });
  return snapScriptPromise;
}

/**
 * Minta backend membuatkan transaksi Midtrans, lalu dapatkan snap `token`.
 * booking: { catId, no, catName, pemilik, email, hp, burung, nominal }
 */
async function createTransaction(booking) {
  if (!API_BASE_URL) {
    throw new Error(
      "Backend pembayaran belum disambungkan. Set VITE_API_BASE_URL di .env setelah Edge Function di-deploy."
    );
  }
  const orderId = `gantangan-${booking.catId}-${booking.no}-${Date.now()}`;
  const res = await fetch(`${API_BASE_URL}/create-transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
      gross_amount: booking.nominal,
      customer: {
        first_name: booking.pemilik,
        email: booking.email,
        phone: booking.hp,
      },
      item_details: [
        {
          id: `${booking.catId}-${booking.no}`,
          name: `Gantangan ${booking.catName} No.${booking.no} — ${booking.burung}`,
          price: booking.nominal,
          quantity: 1,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("Gagal membuat transaksi. Coba lagi atau hubungi panitia.");
  return res.json(); // { token, order_id }
}

/**
 * Buka popup pembayaran Midtrans (Snap). Memanggil callback sesuai hasil.
 */
export async function payWithMidtrans(booking, { onSuccess, onPending, onError, onClose } = {}) {
  if (!isPaymentGatewayConfigured()) {
    onError?.(
      new Error(
        "Pembayaran online belum aktif untuk event ini. Silakan transfer manual sesuai instruksi di bawah."
      )
    );
    return;
  }
  try {
    const { token } = await createTransaction(booking);
    await loadSnapScript();
    window.snap.pay(token, {
      onSuccess: (result) => onSuccess?.(result),
      onPending: (result) => onPending?.(result),
      onError: (result) => onError?.(result),
      onClose: () => onClose?.(),
    });
  } catch (err) {
    onError?.(err);
  }
}
