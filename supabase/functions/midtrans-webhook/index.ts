// supabase/functions/midtrans-webhook/index.ts
//
// Endpoint ini yang dipanggil OTOMATIS oleh Midtrans setiap kali status
// pembayaran berubah (ini yang bikin konfirmasi jadi benar-benar otomatis,
// tidak perlu admin klik "Terima" manual lagi).
//
// Cara pasang nanti di dashboard Midtrans:
//   Settings → Configuration → Payment Notification URL, isi dengan:
//   https://<project-id>.supabase.co/functions/v1/midtrans-webhook
//
// Cara deploy:
//   supabase functions deploy midtrans-webhook

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function sha512Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  try {
    const notif = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = notif;

    // Wajib: verifikasi signature supaya notifikasi ini benar dari Midtrans,
    // bukan orang lain yang menembak endpoint ini langsung.
    const expected = await sha512Hex(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY);
    if (expected !== signature_key) {
      return new Response(JSON.stringify({ error: "Signature tidak valid" }), { status: 403 });
    }

    let newStatus: "terkunci" | "kosong" | null = null;
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) newStatus = "terkunci";
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      newStatus = "kosong";
    }

    if (newStatus) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      // order_id formatnya "gantangan-{catId}-{no}-{timestamp}", ambil catId & no
      const [, catId, no] = order_id.split("-");
      await supabase
        .from("bookings")
        .update({ status: newStatus, confirmed_at: newStatus === "terkunci" ? new Date().toISOString() : null })
        .eq("category_id", catId)
        .eq("no", Number(no));
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
