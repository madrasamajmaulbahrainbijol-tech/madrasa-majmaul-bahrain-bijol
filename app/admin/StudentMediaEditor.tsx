"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { FiFileText, FiImage, FiSave, FiUpload, FiX } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";

type AdmissionMedia = {
  id: string;
  student_id: string | null;
  student_name: string | null;
  student_photo_url: string | null;
  student_document_type: string | null;
  student_document_url: string | null;
  certificate_type: string | null;
  certificate_url: string | null;
};

const BUCKET = "admission-documents";

function cleanFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "file";
  return `${base}${ext}`;
}

async function resolveUrl(path: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl || "";
}

export default function StudentMediaEditor() {
  const pathname = usePathname();
  const routeId = useMemo(() => {
    const match = pathname.match(/^\/admin\/students\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [pathname]);

  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<AdmissionMedia | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [documentType, setDocumentType] = useState("Identity / Admission Document");
  const [certificateType, setCertificateType] = useState("Certificate");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!routeId) {
      setOpen(false);
      setRecord(null);
      return;
    }

    let cancelled = false;
    async function load() {
      setError("");
      let query = await supabase
        .from("admissions")
        .select("id,student_id,student_name,student_photo_url,student_document_type,student_document_url,certificate_type,certificate_url")
        .eq("student_id", routeId)
        .maybeSingle();
      if (!query.data && !query.error) {
        query = await supabase
          .from("admissions")
          .select("id,student_id,student_name,student_photo_url,student_document_type,student_document_url,certificate_type,certificate_url")
          .eq("id", routeId)
          .maybeSingle();
      }
      if (cancelled || query.error || !query.data) return;
      const item = query.data as AdmissionMedia;
      setRecord(item);
      setDocumentType(item.student_document_type || "Identity / Admission Document");
      setCertificateType(item.certificate_type || "Certificate");
      setPhotoPreview(await resolveUrl(item.student_photo_url));
      setDocumentName(item.student_document_url ? "Current document available" : "No document uploaded");
      setCertificateName(item.certificate_url ? "Current certificate available" : "No certificate uploaded");
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [routeId]);

  useEffect(() => {
    if (!routeId) return;
    const handle = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button) return;
      const text = (button.textContent || "").trim().toLowerCase();
      if (text === "edit" || text.startsWith("edit ")) setOpen(true);
    };
    document.addEventListener("click", handle, true);
    return () => document.removeEventListener("click", handle, true);
  }, [routeId]);

  if (!routeId || !record) return null;

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  async function upload(file: File, kind: "photo" | "document" | "certificate") {
    const path = `students/${record.id}/${kind}-${Date.now()}-${cleanFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    });
    if (uploadError) throw uploadError;
    return path;
  }

  async function saveMedia() {
    if (!photoFile && !documentFile && !certificateFile) {
      setError("Please choose a new photo or document first.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updates: Record<string, string | null> = {};
      if (photoFile) updates.student_photo_url = await upload(photoFile, "photo");
      if (documentFile) {
        updates.student_document_url = await upload(documentFile, "document");
        updates.student_document_type = documentType.trim() || "Identity / Admission Document";
      }
      if (certificateFile) {
        updates.certificate_url = await upload(certificateFile, "certificate");
        updates.certificate_type = certificateType.trim() || "Certificate";
      }
      const { error: updateError } = await supabase.from("admissions").update(updates).eq("id", record.id);
      if (updateError) throw updateError;
      setMessage("Photo / documents updated successfully.");
      setPhotoFile(null);
      setDocumentFile(null);
      setCertificateFile(null);
      setTimeout(() => window.location.reload(), 650);
    } catch (e: any) {
      setError(e?.message || "Unable to update photo or documents.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-green-700">Student Media</p>
                <h2 className="text-2xl font-black">Edit Photo & Documents</h2>
                <p className="mt-1 text-sm text-slate-500">{record.student_name} • {record.student_id || "Student"}</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl border p-3 text-slate-600 hover:bg-slate-50" aria-label="Close"><FiX /></button>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
              {message && <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">{message}</div>}

              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <p className="flex items-center gap-2 font-black"><FiImage /> Student Photo</p>
                  {photoPreview ? <img src={photoPreview} alt="Student preview" className="mt-4 h-56 w-full rounded-2xl bg-white object-contain" /> : <div className="mt-4 flex h-56 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-400">No photo</div>}
                </div>
                <label className="flex cursor-pointer flex-col justify-center rounded-2xl border-2 border-dashed border-green-200 bg-green-50/60 p-6 hover:border-green-500">
                  <FiUpload className="text-3xl text-green-700" />
                  <span className="mt-3 text-lg font-black">Replace Student Photo</span>
                  <span className="mt-1 text-sm text-slate-500">Choose JPG, PNG or WEBP. The new photo will also appear on the profile, ID card and printouts.</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} className="mt-4 block w-full text-sm" />
                </label>
              </div>

              <div className="rounded-2xl border p-5">
                <p className="flex items-center gap-2 text-lg font-black"><FiFileText /> Identity / Admission Document</p>
                <p className="mt-1 text-sm text-slate-500">{documentName}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={documentType} onChange={(e) => setDocumentType(e.target.value)} placeholder="Document type" className="rounded-xl border px-4 py-3" />
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} className="rounded-xl border px-3 py-2.5 text-sm" />
                </div>
              </div>

              <div className="rounded-2xl border p-5">
                <p className="flex items-center gap-2 text-lg font-black"><FiFileText /> Certificate</p>
                <p className="mt-1 text-sm text-slate-500">{certificateName}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={certificateType} onChange={(e) => setCertificateType(e.target.value)} placeholder="Certificate type" className="rounded-xl border px-4 py-3" />
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} className="rounded-xl border px-3 py-2.5 text-sm" />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                <button onClick={() => setOpen(false)} className="rounded-xl border px-5 py-3 font-black text-slate-700">Cancel</button>
                <button onClick={saveMedia} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-black text-white disabled:opacity-60"><FiSave /> {saving ? "Uploading & Saving..." : "Save Photo & Documents"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
