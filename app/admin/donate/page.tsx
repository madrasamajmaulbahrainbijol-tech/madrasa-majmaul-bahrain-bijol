"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiImage, FiRefreshCw, FiSave, FiTrash2, FiUpload } from "react-icons/fi";
import { supabase } from "../../lib/supabase/client";

type DonationSettings = {
  id: string;
  quran_reference: string;
  quran_text: string;
  hadith_reference: string;
  hadith_text: string;
  upi_id: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  qr_code_url: string | null;
};

const emptyForm = {
  quran_reference: "",
  quran_text: "",
  hadith_reference: "",
  hadith_text: "",
  upi_id: "",
  account_holder: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
};

export default function AdminDonatePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<DonationSettings | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [qrUrl, setQrUrl] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/admin"); return; }
    const { data, error: e } = await supabase.from("donation_settings").select("*").limit(1).maybeSingle();
    if (e) setError(e.message);
    if (data) {
      setSettings(data as DonationSettings);
      setForm({
        quran_reference: data.quran_reference || "", quran_text: data.quran_text || "",
        hadith_reference: data.hadith_reference || "", hadith_text: data.hadith_text || "",
        upi_id: data.upi_id || "", account_holder: data.account_holder || "",
        bank_name: data.bank_name || "", account_number: data.account_number || "", ifsc_code: data.ifsc_code || "",
      });
      setQrUrl(data.qr_code_url || "");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(""); setError("");
    try {
      const payload = { ...form, qr_code_url: qrUrl || null, updated_at: new Date().toISOString() };
      const result = settings
        ? await supabase.from("donation_settings").update(payload).eq("id", settings.id).select().single()
        : await supabase.from("donation_settings").insert(payload).select().single();
      if (result.error) throw result.error;
      setSettings(result.data as DonationSettings);
      setMessage("Donation page updated successfully.");
    } catch (e: any) { setError(e?.message || "Unable to save donation settings."); }
    finally { setSaving(false); }
  };

  const uploadQr = async () => {
    if (!qrFile) return;
    setUploading(true); setMessage(""); setError("");
    try {
      if (!qrFile.type.startsWith("image/")) throw new Error("Please select an image file.");
      const ext = qrFile.name.split(".").pop()?.toLowerCase() || "png";
      const path = `qr-code-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("donation-assets").upload(path, qrFile, { upsert: false, contentType: qrFile.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("donation-assets").getPublicUrl(path);
      const old = qrUrl;
      setQrUrl(data.publicUrl);
      setQrFile(null);
      if (old && old.includes("/storage/v1/object/public/donation-assets/")) {
        const oldPath = old.split("/donation-assets/")[1];
        if (oldPath) await supabase.storage.from("donation-assets").remove([oldPath]);
      }
      setMessage("QR code uploaded. Click Save Changes to publish it.");
    } catch (e: any) { setError(e?.message || "QR upload failed."); }
    finally { setUploading(false); }
  };

  const removeQr = async () => {
    if (!qrUrl) return;
    setSaving(true); setError(""); setMessage("");
    try {
      if (qrUrl.includes("/storage/v1/object/public/donation-assets/")) {
        const path = qrUrl.split("/donation-assets/")[1];
        if (path) await supabase.storage.from("donation-assets").remove([path]);
      }
      if (settings) {
        const { error: e } = await supabase.from("donation_settings").update({ qr_code_url: null, updated_at: new Date().toISOString() }).eq("id", settings.id);
        if (e) throw e;
      }
      setQrUrl(""); setMessage("QR code removed.");
    } catch (e: any) { setError(e?.message || "Unable to remove QR code."); }
    finally { setSaving(false); }
  };

  const field = (label: string, key: keyof typeof form, placeholder = "") => (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input value={form[key]} onChange={(e) => setForm((x) => ({ ...x, [key]: e.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100" />
    </label>
  );

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><FiRefreshCw className="animate-spin text-3xl text-green-700" /></main>;

  return (
    <main className="min-h-screen bg-[#f4f7f5] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <button onClick={() => router.push("/admin/dashboard")} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-bold text-slate-600 hover:bg-slate-100"><FiArrowLeft /> Dashboard</button>
          <div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.25em] text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="text-lg font-black sm:text-xl">Donate Page Management</h1></div>
          <button onClick={load} className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50" title="Refresh"><FiRefreshCw /></button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
        <div className="rounded-3xl bg-gradient-to-r from-green-900 via-green-800 to-green-700 p-7 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-green-200">Public Donate Page</p>
          <h2 className="mt-2 text-3xl font-black">Control every donation detail from here.</h2>
          <p className="mt-3 max-w-3xl text-green-100">Update the UPI, bank details, QR code and the Quran/Hadith inspiration shown on the public Donate page without changing website code.</p>
        </div>

        {message && <div className="mt-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-bold text-green-800"><FiCheck /> {message}</div>}
        {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-700">{error}</div>}

        <form onSubmit={save} className="mt-7 space-y-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.2em] text-green-700">Islamic Inspiration</p><h3 className="mt-1 text-2xl font-black">Quran & Hadith</h3></div>
            <div className="grid gap-6 lg:grid-cols-2">
              {field("Quran Reference", "quran_reference", "e.g. Quran 2:261")}
              {field("Hadith Reference", "hadith_reference", "e.g. Sahih Muslim")}
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Quran Text</span><textarea value={form.quran_text} onChange={(e) => setForm((x) => ({ ...x, quran_text: e.target.value }))} rows={6} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100" /></label>
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Hadith Text</span><textarea value={form.hadith_text} onChange={(e) => setForm((x) => ({ ...x, hadith_text: e.target.value }))} rows={6} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100" /></label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.2em] text-green-700">Digital Donation</p><h3 className="mt-1 text-2xl font-black">UPI & Bank Account</h3></div>
            <div className="grid gap-5 md:grid-cols-2">{field("UPI ID", "upi_id", "example@upi")}{field("Account Holder", "account_holder", "Madrasa name")}{field("Bank Name", "bank_name")}{field("Account Number", "account_number")}{field("IFSC Code", "ifsc_code")}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-green-700">QR Payment</p><h3 className="mt-1 text-2xl font-black">Donation QR Code</h3></div><FiImage className="text-3xl text-green-700" /></div>
            <div className="grid gap-7 lg:grid-cols-[260px_1fr] lg:items-center">
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border-2 border-dashed border-green-200 bg-green-50 p-5">{qrUrl ? <img src={qrUrl} alt="Donation QR Code" className="h-56 w-56 rounded-xl bg-white object-contain shadow" /> : <div className="text-center text-slate-500"><FiImage className="mx-auto text-4xl" /><p className="mt-3 font-bold">No QR code uploaded</p></div>}</div>
              <div>
                <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-5"><span className="block text-sm font-black text-slate-700">Choose new QR image</span><input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => setQrFile(e.target.files?.[0] || null)} className="mt-3 block w-full text-sm" /></label>
                <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={uploadQr} disabled={!qrFile || uploading} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-black text-white disabled:opacity-50"><FiUpload /> {uploading ? "Uploading..." : "Upload / Replace QR"}</button>{qrUrl && <button type="button" onClick={removeQr} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-black text-red-700 hover:bg-red-50"><FiTrash2 /> Delete QR</button>}</div>
                <p className="mt-3 text-xs text-slate-500">Use a clear PNG/JPG QR image. Uploading a replacement removes the previous managed QR file.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => router.push("/donate")} className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-black text-slate-700">View Public Donate Page</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-3 font-black text-white shadow-lg hover:bg-green-800 disabled:opacity-60"><FiSave /> {saving ? "Saving..." : "Save Changes"}</button></div>
        </form>
      </section>
    </main>
  );
}
