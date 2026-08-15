"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiEye,
  FiFileText,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase/client";

type AdmissionStatus = "new" | "under_review" | "approved" | "rejected";

type Admission = {
  id: string;
  student_name: string | null;
  guardian_name: string | null;
  mobile: string | null;
  email: string | null;
  course: string | null;
  message: string | null;
  date_of_birth: string | null;
  status: AdmissionStatus;
  created_at: string;
};

type ParsedDetails = Record<string, string>;

const statusOptions: { value: AdmissionStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const detailKeys = [
  "Application Number",
  "Father's Name",
  "Mother's Name",
  "Guardian Name",
  "Guardian Relationship",
  "Relationship",
  "Father Mobile Number 1",
  "Mobile Number 1",
  "Father Mobile Number 2",
  "Mobile Number 2",
  "Mother Mobile Number",
  "Parent Occupation",
  "Previous Education",
  "Full Address",
  "Address",
  "Village / Town",
  "Village/Town",
  "Village",
  "Post Office",
  "District",
  "State",
  "PIN Code",
  "Pin Code",
  "Pincode",
  "Country",
  "Student Photo",
  "Identity Proof Type",
  "Identity Proof",
  "Identity Proof File",
  "Additional Documents",
];

function getStatusLabel(status: AdmissionStatus) {
  return statusOptions.find((item) => item.value === status)?.label || "New";
}

function getStatusClasses(status: AdmissionStatus) {
  switch (status) {
    case "new":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "under_review":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDob(dateString: string | null) {
  if (!dateString) return "—";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseMessage(message: string | null): ParsedDetails {
  if (!message) return {};

  const details: ParsedDetails = {};

  for (const line of message.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) details[key] = value;
  }

  if (Object.keys(details).length > 0 && message.includes("\n")) return details;

  const normalized = message.replace(/\s+/g, " ").trim();
  const labels = Array.from(new Set(detailKeys)).sort((a, b) => b.length - a.length);

  for (const label of labels) {
    const start = normalized.toLowerCase().indexOf(`${label.toLowerCase()}:`);
    if (start === -1) continue;

    const valueStart = start + label.length + 1;
    const nextPositions = labels
      .map((nextLabel) => normalized.toLowerCase().indexOf(` ${nextLabel.toLowerCase()}:`, valueStart))
      .filter((position) => position !== -1);
    const next = nextPositions.length ? Math.min(...nextPositions) : normalized.length;
    const value = normalized.slice(valueStart, next).trim();
    if (value) details[label] = value;
  }

  return details;
}

function getFileUrl(path: string | undefined) {
  if (!path || path === "—") return "";
  if (/^https?:\/\//i.test(path)) return path;

  return supabase.storage.from("admission-documents").getPublicUrl(path).data.publicUrl;
}

function getValue(details: ParsedDetails, ...keys: string[]) {
  for (const key of keys) {
    const value = details[key];
    if (value && value.trim() && value.toLowerCase() !== "not provided") return value.trim();
  }
  return "—";
}

function FormField({
  label,
  value,
  icon,
  highlight = false,
  wide = false,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`min-w-0 border-b border-r border-slate-200 px-3 py-2.5 last:border-r-0 sm:px-4 ${
        wide ? "sm:col-span-2" : ""
      } ${highlight ? "bg-emerald-50/65" : "bg-white"}`}
    >
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[1.15px] text-slate-500">
        {icon ? <span className="shrink-0 text-emerald-800">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1 break-words text-[12px] font-bold leading-4 text-slate-900 sm:text-[13px]">{value}</div>
    </div>
  );
}

function FormSection({
  number,
  title,
  subtitle,
  children,
  className = "",
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-300 bg-white ${className}`}>
      <div className="flex items-center gap-2 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-white px-3 py-2 sm:px-4">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-800 text-[10px] font-black text-white">{number}</span>
        <div className="min-w-0">
          <h3 className="text-[10px] font-black uppercase tracking-[1.25px] text-emerald-900 sm:text-[11px]">{title}</h3>
          {subtitle ? <p className="text-[9px] text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function DocumentForm({
  admission,
  details,
  photoUrl,
  applicationNumber,
}: {
  admission: Admission;
  details: ParsedDetails;
  photoUrl: string;
  applicationNumber: string;
}) {
  const father = getValue(details, "Father's Name", "Father Name");
  const mother = getValue(details, "Mother's Name", "Mother Name");
  const guardian = getValue(details, "Guardian Name", "Guardian");
  const relationship = getValue(details, "Guardian Relationship", "Relationship", "Guardian Relation");
  const mobile1 = getValue(details, "Father Mobile Number 1", "Mobile Number 1", "Mobile");
  const mobile2 = getValue(details, "Father Mobile Number 2", "Mobile Number 2", "Alternate Mobile", "Mother Mobile Number");
  const occupation = getValue(details, "Parent Occupation", "Occupation");
  const previousEducation = getValue(details, "Previous Education");
  const fullAddress = getValue(details, "Full Address", "Address");
  const village = getValue(details, "Village / Town", "Village/Town", "Village");
  const postOffice = getValue(details, "Post Office");
  const district = getValue(details, "District");
  const state = getValue(details, "State");
  const pin = getValue(details, "PIN Code", "Pin Code", "Pincode");
  const country = getValue(details, "Country");
  const identityType = getValue(details, "Identity Proof Type");
  const identityFile = getValue(details, "Identity Proof File", "Identity Proof");
  const identityUrl = getFileUrl(identityFile);
  const email = admission.email?.trim() || "—";

  return (
    <article className="print-document relative mx-auto w-full max-w-[1040px] overflow-hidden rounded-2xl border border-emerald-900/40 bg-white shadow-[0_20px_60px_rgba(0,70,45,0.10)] print:max-w-none print:rounded-none print:border-[1.2px] print:border-emerald-900/60 print:shadow-none">
      <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-emerald-900/20 print:inset-1" />

      <div className="relative px-4 pb-3 pt-4 sm:px-6 sm:pt-5 print:px-5 print:pb-3 print:pt-4">
        <div className="grid grid-cols-[72px_1fr_92px] items-start gap-3 sm:grid-cols-[88px_1fr_112px] print:grid-cols-[76px_1fr_92px]">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-emerald-800 bg-emerald-50 p-1 sm:h-[82px] sm:w-[82px] print:h-[68px] print:w-[68px]">
            <div className="flex h-full w-full items-center justify-center rounded-full border border-emerald-700 text-center text-[8px] font-black uppercase leading-3 tracking-wide text-emerald-900">
              <span>MMB<br />Bijol</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[8px] font-black uppercase tracking-[3px] text-emerald-800 print:text-[7px]">Official Admission Record</p>
            <h1 className="mt-1 text-[22px] font-black uppercase leading-none tracking-tight text-emerald-950 sm:text-[30px] print:text-[22px]">Madrasa Majmaul Bahrain Bijol</h1>
            <p className="mt-1 text-[10px] font-semibold text-slate-600 print:text-[8px]">Bijol, Madhepur, Katihar, Bihar - 854317</p>
            <div className="mx-auto mt-2 flex max-w-[320px] items-center justify-center gap-2">
              <span className="h-px flex-1 bg-emerald-800/60" />
              <span className="whitespace-nowrap rounded-md bg-emerald-800 px-3 py-1 text-[9px] font-black uppercase tracking-[1.6px] text-white print:px-2 print:py-0.5 print:text-[8px]">Admission Application Form</span>
              <span className="h-px flex-1 bg-emerald-800/60" />
            </div>
          </div>

          <div className="justify-self-end">
            <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-slate-100 shadow-sm">
              {photoUrl ? (
                <img src={photoUrl} alt="Student photograph" className="h-[92px] w-[78px] object-cover sm:h-[112px] sm:w-[92px] print:h-[86px] print:w-[72px]" />
              ) : (
                <div className="flex h-[92px] w-[78px] items-center justify-center text-center text-[8px] font-bold uppercase text-slate-400 sm:h-[112px] sm:w-[92px] print:h-[86px] print:w-[72px]">Student<br />Photograph</div>
              )}
            </div>
            <p className="mt-1 text-center text-[7px] font-black uppercase tracking-wide text-slate-500">Student Photograph</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-emerald-200 bg-white print:mt-2">
          <div className="border-r border-emerald-100 px-2.5 py-2 print:py-1.5"><p className="text-[7px] font-black uppercase tracking-[1.1px] text-emerald-800">Application Number</p><p className="mt-0.5 text-[10px] font-black text-slate-900 print:text-[9px]">{applicationNumber}</p></div>
          <div className="border-r border-emerald-100 px-2.5 py-2 print:py-1.5"><p className="text-[7px] font-black uppercase tracking-[1.1px] text-emerald-800">Received On</p><p className="mt-0.5 text-[10px] font-bold text-slate-900 print:text-[9px]">{formatDate(admission.created_at)}</p></div>
          <div className="px-2.5 py-2 print:py-1.5"><p className="text-[7px] font-black uppercase tracking-[1.1px] text-emerald-800">Current Status</p><p className="mt-0.5 text-[10px] font-black text-emerald-800 print:text-[9px]">{getStatusLabel(admission.status)}</p></div>
        </div>

        <div className="mt-2 h-[2px] bg-emerald-800 print:mt-2" />

        <div className="mt-2.5 space-y-2 print:space-y-1.5">
          <FormSection number="01" title="Student Information" subtitle="Basic student details">
            <FormField label="Student Name" value={admission.student_name || "—"} icon={<FiUser />} />
            <FormField label="Date of Birth" value={formatDob(admission.date_of_birth)} icon={<FiCalendar />} />
            <FormField label="Previous Education" value={previousEducation} icon={<FiBookOpen />} />
            <FormField label="Course / Programme" value={admission.course || "—"} icon={<FiBookOpen />} highlight />
          </FormSection>

          <FormSection number="02" title="Parent / Guardian Information" subtitle="Family and contact details">
            <FormField label="Father's Name" value={father} icon={<FiUser />} />
            <FormField label="Mother's Name" value={mother} icon={<FiUser />} />
            <FormField label="Guardian Name" value={guardian} icon={<FiUsers />} />
            <FormField label="Relationship" value={relationship} icon={<FiUsers />} />
            <FormField label="Mobile Number 1" value={mobile1} icon={<FiPhone />} />
            <FormField label="Mobile Number 2" value={mobile2} icon={<FiPhone />} />
            <FormField label="Parent Occupation" value={occupation} icon={<FiUser />} />
            <FormField label="Email" value={email} icon={<FiMail />} />
          </FormSection>

          <FormSection number="03" title="Address Information" subtitle="Residential address provided in the application">
            <FormField label="Full Address" value={fullAddress} icon={<FiMapPin />} wide />
            <FormField label="Village / Town" value={village} icon={<FiMapPin />} />
            <FormField label="Post Office" value={postOffice} icon={<FiMapPin />} />
            <FormField label="District" value={district} icon={<FiMapPin />} />
            <FormField label="State" value={state} icon={<FiMapPin />} />
            <FormField label="PIN Code" value={pin} icon={<FiMapPin />} />
            <FormField label="Country" value={country} icon={<FiMapPin />} />
          </FormSection>

          <FormSection number="04" title="Course Selection" subtitle="Programme selected by the applicant">
            <FormField label="Selected Course / Programme" value={admission.course || "—"} icon={<FiBookOpen />} highlight wide />
          </FormSection>

          <section className="print-hidden overflow-hidden rounded-xl border border-slate-300 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white px-3 py-2 sm:px-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-800 text-[10px] font-black text-white">05</span>
              <div><h3 className="text-[10px] font-black uppercase tracking-[1.25px] text-emerald-900 sm:text-[11px]">Documents & Verification</h3><p className="text-[9px] text-slate-500">Submitted documents remain available to the administrator.</p></div>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-[180px_1fr] sm:p-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><p className="text-[9px] font-black uppercase tracking-[1px] text-slate-500">Student Photo</p>{photoUrl ? <img src={photoUrl} alt="Student" className="mt-2 h-40 w-full rounded-md object-cover" /> : <div className="mt-2 flex h-40 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-400">No photo</div>}</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[1px] text-slate-500">Identity Proof</p><p className="mt-1 text-sm font-bold text-slate-900">{identityType}</p></div>{identityUrl ? <a href={identityUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-black text-emerald-800 hover:bg-emerald-50"><FiEye /> View</a> : null}</div>
                <p className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">Identity documents are intentionally excluded from the printable admission form for privacy and compactness.</p>
              </div>
            </div>
          </section>

          <div className="print-hidden rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-900"><strong>Verification note:</strong> Please verify the student information and submitted documents before approving or rejecting this application.</div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-2 text-[8px] text-slate-500 print:mt-2 print:pt-1.5"><span>Official Admission Record • Madrasa Majmaul Bahrain Bijol</span><span>Application No. {applicationNumber}</span></div>
      </div>
    </article>
  );
}

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdmissionStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  async function loadAdmissions() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error(userError.message);
      if (!user) { window.location.href = "/admin"; return; }

      const { data, error } = await supabase.from("admissions").select(`id, student_name, guardian_name, mobile, email, course, message, date_of_birth, status, created_at`).order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      const rows = (data || []) as Admission[];
      setAdmissions(rows);
      setSelectedId((current) => current && rows.some((row) => row.id === current) ? current : rows[0]?.id || null);
    } catch (error) {
      console.error("Load admissions error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Admission applications load nahi ho pa rahi hain.");
      setAdmissions([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(admissionId: string, newStatus: AdmissionStatus) {
    setUpdatingId(admissionId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.from("admissions").update({ status: newStatus }).eq("id", admissionId);
      if (error) throw new Error(error.message);
      setAdmissions((current) => current.map((item) => item.id === admissionId ? { ...item, status: newStatus } : item));
      setSuccessMessage(`Application marked as ${getStatusLabel(newStatus)} successfully.`);
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Status update error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Status update nahi ho pa raha hai.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteAdmission(admissionId: string) {
    if (!window.confirm("Kya aap is admission application ko permanently delete karna chahte hain?")) return;

    try {
      const { error } = await supabase.from("admissions").delete().eq("id", admissionId);
      if (error) throw new Error(error.message);
      setAdmissions((current) => {
        const next = current.filter((item) => item.id !== admissionId);
        setSelectedId((selected) => selected === admissionId ? next[0]?.id || null : selected);
        return next;
      });
      setSuccessMessage("Admission application deleted successfully.");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Delete admission error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Admission application delete nahi ho pa rahi hai.");
    }
  }

  function printAdmission(admissionId: string) {
    setPrintingId(admissionId);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setPrintingId(null), 600);
    }, 120);
  }

  useEffect(() => { loadAdmissions(); }, []);

  const courses = useMemo(() => Array.from(new Set(admissions.map((item) => item.course?.trim()).filter((value): value is string => Boolean(value)))).sort(), [admissions]);
  const filteredAdmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return admissions.filter((item) => {
      const searchable = [item.student_name, item.guardian_name, item.mobile, item.email, item.course, item.message].filter(Boolean).join(" ").toLowerCase();
      return (!search || searchable.includes(search)) && (courseFilter === "all" || item.course === courseFilter) && (statusFilter === "all" || item.status === statusFilter);
    });
  }, [admissions, searchTerm, courseFilter, statusFilter]);

  const counts = {
    all: admissions.length,
    new: admissions.filter((item) => item.status === "new").length,
    under_review: admissions.filter((item) => item.status === "under_review").length,
    approved: admissions.filter((item) => item.status === "approved").length,
    rejected: admissions.filter((item) => item.status === "rejected").length,
  };

  const selectedAdmission = admissions.find((item) => item.id === selectedId) || null;
  const selectedDetails = selectedAdmission ? parseMessage(selectedAdmission.message) : {};
  const selectedPhoto = selectedAdmission ? getFileUrl(getValue(selectedDetails, "Student Photo")) : "";
  const selectedApplicationNumber = selectedAdmission ? getValue(selectedDetails, "Application Number") : "—";

  function clearFilters() {
    setSearchTerm("");
    setCourseFilter("all");
    setStatusFilter("all");
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <style jsx global>{`
        @media print {
          html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-hidden { display: none !important; }
          .print-page { display: block !important; width: 100% !important; max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .print-document { display: block !important; width: 100% !important; max-width: none !important; margin: 0 !important; box-shadow: none !important; }
          @page { size: A4 portrait; margin: 7mm; }
        }
      `}</style>

      <div className="print-hidden mx-auto max-w-[1500px] px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Link href="/admin/dashboard" className="hover:text-emerald-800">Dashboard</Link><span>›</span><span>Admissions</span>{selectedAdmission ? <><span>›</span><span>Application Details</span></> : null}</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{selectedAdmission ? "Admission Application Details" : "Admission Applications"}</h1>
          </div>

          {selectedAdmission ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setSelectedId(null)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black hover:bg-slate-50"><FiArrowLeft /> Back to List</button>
              <button type="button" onClick={() => updateStatus(selectedAdmission.id, "approved")} disabled={updatingId === selectedAdmission.id} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"><FiCheckCircle /> Approve</button>
              <button type="button" onClick={() => updateStatus(selectedAdmission.id, "rejected")} disabled={updatingId === selectedAdmission.id} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-red-700 disabled:opacity-60"><FiXCircle /> Reject</button>
              <button type="button" onClick={() => printAdmission(selectedAdmission.id)} disabled={printingId === selectedAdmission.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black hover:bg-slate-50 disabled:opacity-60"><FiPrinter /> {printingId === selectedAdmission.id ? "Preparing..." : "Print"}</button>
            </div>
          ) : (
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-900"><FiArrowLeft /> Dashboard</Link>
          )}
        </div>

        {errorMessage ? <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"><FiAlertCircle /> {errorMessage}</div> : null}
        {successMessage ? <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><FiCheckCircle /> {successMessage}</div> : null}

        {!selectedAdmission ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by student, guardian, mobile or course..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white" /></div>
                <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"><option value="all">All Courses</option>{courses.map((course) => <option key={course} value={course}>{course}</option>)}</select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | AdmissionStatus)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"><option value="all">All Status</option>{statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
                <button type="button" onClick={clearFilters} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50">Clear</button>
                <button type="button" onClick={loadAdmissions} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-black text-white hover:bg-emerald-900 disabled:opacity-60"><FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[["All", counts.all, "all"], ["New", counts.new, "new"], ["Under Review", counts.under_review, "under_review"], ["Approved", counts.approved, "approved"], ["Rejected", counts.rejected, "rejected"]].map(([label, value, key]) => (
                <button key={key} type="button" onClick={() => setStatusFilter(key as "all" | AdmissionStatus)} className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${statusFilter === key ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}><p className="text-[10px] font-black uppercase tracking-[1.4px] text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500">Loading admission applications...</div> : filteredAdmissions.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><FiFileText className="mx-auto text-3xl text-slate-300" /><p className="mt-3 font-black text-slate-700">No admission applications found.</p></div> : filteredAdmissions.map((admission, index) => {
                const details = parseMessage(admission.message);
                const appNumber = getValue(details, "Application Number");
                return <button key={admission.id} type="button" onClick={() => setSelectedId(admission.id)} className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-lg sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><FiUser /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-black text-slate-900">{admission.student_name || "Unnamed Student"}</h2><span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getStatusClasses(admission.status)}`}>{getStatusLabel(admission.status)}</span></div><p className="mt-1 text-xs font-semibold text-slate-500">Application #{index + 1} • {appNumber} • Received {formatDate(admission.created_at)}</p></div></div><div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600"><span className="rounded-lg bg-slate-50 px-3 py-2">{admission.course || "Course not specified"}</span><span className="rounded-lg bg-slate-50 px-3 py-2">{admission.mobile || "No mobile"}</span><span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">Open <FiChevronDown className="-rotate-90" /></span></div></div></button>;
              })}
            </div>
          </>
        ) : null}
      </div>

      {selectedAdmission ? <div className="print-page mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><div className="print-hidden mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><FiUser /></div><div className="min-w-0"><p className="truncate text-sm font-black">{selectedAdmission.student_name || "Unnamed Student"}</p><p className="text-xs font-semibold text-slate-500">{selectedApplicationNumber}</p></div></div><span className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClasses(selectedAdmission.status)}`}>{getStatusLabel(selectedAdmission.status)}</span></div><DocumentForm admission={selectedAdmission} details={selectedDetails} photoUrl={selectedPhoto} applicationNumber={selectedApplicationNumber} /></div> : null}
    </main>
  );
}
