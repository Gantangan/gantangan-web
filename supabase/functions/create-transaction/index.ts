// supabase/functions/create-transaction/index.ts
//
// Edge Function ini yang benar-benar bicara ke Midtrans pakai Server Key.
// Server Key disimpan sebagai Secret di Supabase (bukan di kode), jadi aman.
//
// Cara deploy nanti (setelah project Supabase aktif):
//   supabase secrets set MIDTRANS_SERVER_KEY=your-server-key-here
//   supabase functions deploy create-transaction
//
// Frontend akan memanggil endpoint ini lewat src/services/payment.js

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY") ?? "";
const MIDTRANS_ENV = Deno.env.get("MIDTRANS_ENV") ?? "sandbox"; // "sandbox" | "production"

const SNAP_URL =
  MIDTRANS_ENV === "production"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

serve(async (req) => {
  // CORS dasar biar bisa dipanggil dari browser (sesuaikan origin di produksi)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { order_id, gross_amount, customer, item_details } = body;

    if (!order_id || !gross_amount) {
      return new Response(JSON.stringify({ error: "order_id dan gross_amount wajib diisi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = "Basic " + btoa(MIDTRANS_SERVER_KEY + ":");

    const midtransRes = await fetch(SNAP_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        transaction_details: { order_id, gross_amount },
        customer_details: {
          first_name: customer?.first_name,
          email: customer?.email,
          phone: customer?.phone,
        },
        item_details,
      }),
    });

    const data = await midtransRes.json();
    if (!midtransRes.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: simpan order_id + status "pending" ke tabel `bookings` di database
    // supaya webhook bisa mencocokkan saat notifikasi pembayaran masuk.

    return new Response(JSON.stringify({ token: data.token, order_id, redirect_url: data.redirect_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
