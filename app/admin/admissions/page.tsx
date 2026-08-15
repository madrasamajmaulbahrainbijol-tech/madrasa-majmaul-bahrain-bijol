"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
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

function getStatusLabel(status: AdmissionStatus) {
  return (
    statusOptions.find((option) => option.value === status)?.label || "New"
  );
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
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";

  try {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function formatDob(dateString: string | null) {
  if (!dateString) return "—";

  try {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function cleanPhoneNumber(phone: string | null) {
  return phone ? phone.replace(/\D/g, "") : "";
}

function parseMessage(message: string | null): ParsedDetails {
  if (!message) return {};

  return message.split(/\r?\n/).reduce<ParsedDetails>((details, line) => {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) return details;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key) details[key] = value;
    return details;
  }, {});
}

function getFileUrl(path: string | undefined) {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) return path;

  return supabase.storage.from("admission-documents").getPublicUrl(path).data
    .publicUrl;
}

function getValue(details: ParsedDetails, ...keys: string[]) {
  for (const key of keys) {
    const value = details[key];
    if (value && value.trim() && value.toLowerCase() !== "not provided") {
      return value.trim();
    }
  }
  return "—";
}

function Field({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-4 ${
        highlight
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[1.4px] text-gray-500">
        {icon ? <span className="text-emerald-700">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-bold leading-6 text-gray-900">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-sm font-black text-white shadow-sm">
        {number}
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-black uppercase tracking-[1.2px] text-emerald-900">
          {title}
        </h4>
        {subtitle ? <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdmissionStatus>(
    "all"
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  async function loadAdmissions() {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);

      if (!user) {
        window.location.href = "/admin";
        return;
      }

      const { data, error } = await supabase
        .from("admissions")
        .select(
          `
            id,
            student_name,
            guardian_name,
            mobile,
            email,
            course,
            message,
            date_of_birth,
            status,
            created_at
          `
        )
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      setAdmissions((data || []) as Admission[]);
    } catch (error) {
      console.error("Load admissions error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Admission applications load nahi ho pa rahi hain."
      );
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    admissionId: string,
    newStatus: AdmissionStatus
  ) {
    setUpdatingId(admissionId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("admissions")
        .update({ status: newStatus })
        .eq("id", admissionId);

      if (error) throw new Error(error.message);

      setAdmissions((current) =>
        current.map((admission) =>
          admission.id === admissionId
            ? { ...admission, status: newStatus }
            : admission
        )
      );

      setSuccessMessage(
        `Application marked as ${getStatusLabel(newStatus)} successfully.`
      );

      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Status update error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status update nahi ho pa raha hai."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteAdmission(admissionId: string) {
    const confirmed = window.confirm(
      "Kya aap is admission application ko permanently delete karna chahte hain?"
    );

    if (!confirmed) return;

    setDeletingId(admissionId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("admissions")
        .delete()
        .eq("id", admissionId);

      if (error) throw new Error(error.message);

      setAdmissions((current) =>
        current.filter((admission) => admission.id !== admissionId)
      );

      setSuccessMessage("Admission application deleted successfully.");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Delete admission error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Admission application delete nahi ho pa rahi hai."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function printAdmission(admissionId: string) {
    setPrintingId(admissionId);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setPrintingId(null), 500);
    }, 100);
  }

  useEffect(() => {
    loadAdmissions();
  }, []);

  const courses = useMemo(() => {
    return Array.from(
      new Set(
        admissions
          .map((admission) => admission.course?.trim())
          .filter((course): course is string => Boolean(course))
      )
    ).sort();
  }, [admissions]);

  const filteredAdmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return admissions.filter((admission) => {
      const searchable = [
        admission.student_name,
        admission.guardian_name,
        admission.mobile,
        admission.email,
        admission.course,
        admission.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!search || searchable.includes(search)) &&
        (courseFilter === "all" || admission.course === courseFilter) &&
        (statusFilter === "all" || admission.status === statusFilter)
      );
    });
  }, [admissions, searchTerm, courseFilter, statusFilter]);

  const counts = {
    all: admissions.length,
    new: admissions.filter((item) => item.status === "new").length,
    under_review: admissions.filter((item) => item.status === "under_review")
      .length,
    approved: admissions.filter((item) => item.status === "approved").length,
    rejected: admissions.filter((item) => item.status === "rejected").length,
  };

  function clearFilters() {
    setSearchTerm("");
    setCourseFilter("all");
    setStatusFilter("all");
  }

  return (
    <main className="min-h-screen bg-[#f4f7f5] text-gray-900">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
          .admission-card.print-muted {
            display: none !important;
          }
          .admission-card.print-target {
            display: block !important;
            margin: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
          }
          .print-page {
            max-width: none !important;
            padding: 0 !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <header className="print-hidden sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[2.5px] text-emerald-700 sm:text-xs">
              Madrasa Majmaul Bahrain Bijol
            </p>
            <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Admission Applications
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-900"
          >
            <FiArrowLeft />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="print-hidden mx-auto max-w-[1500px] px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#003c2a] via-[#006b3f] to-[#08a84f] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[2px] text-emerald-100">
                <FiFileText /> Online Admissions
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Application Management
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                Review, verify and manage submitted admission applications from one professional workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdmissions}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-emerald-800 shadow-lg transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh Applications"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { key: "all" as const, label: "All", value: counts.all, color: "text-slate-900" },
            { key: "new" as const, label: "New", value: counts.new, color: "text-blue-700" },
            { key: "under_review" as const, label: "Under Review", value: counts.under_review, color: "text-amber-700" },
            { key: "approved" as const, label: "Approved", value: counts.approved, color: "text-emerald-700" },
            { key: "rejected" as const, label: "Rejected", value: counts.rejected, color: "text-red-700" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key === "all" ? "all" : item.key)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                statusFilter === item.key || (item.key === "all" && statusFilter === "all")
                  ? "border-emerald-400 ring-2 ring-emerald-100"
                  : "border-gray-200"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{item.label}</p>
              <p className={`mt-1 text-2xl font-black ${item.color}`}>{item.value}</p>
            </button>
          ))}
        </div>

        {successMessage ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            <FiCheckCircle className="shrink-0 text-lg" />
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
            <div>
              <p className="font-black">Something went wrong</p>
              <p className="mt-1 break-words">{errorMessage}</p>
            </div>
          </div>
        ) : null}

        {!loading && admissions.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by student, guardian, mobile, course..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | AdmissionStatus)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 text-xs font-semibold text-gray-500">
              Showing {filteredAdmissions.length} of {admissions.length} applications
            </div>
          </div>
        ) : null}
      </section>

      <section className="print-page mx-auto max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <FiRefreshCw className="mx-auto animate-spin text-3xl text-emerald-700" />
            <p className="mt-4 font-bold text-gray-700">Loading admission applications...</p>
          </div>
        ) : filteredAdmissions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <FiFileText className="mx-auto text-4xl text-gray-300" />
            <h3 className="mt-4 text-xl font-black text-gray-900">No applications found</h3>
            <p className="mt-2 text-sm text-gray-500">Try changing the search or filters.</p>
          </div>
        ) : (
          <div className="space-y-7">
            {filteredAdmissions.map((admission) => {
              const details = parseMessage(admission.message);
              const applicationNumber = getValue(details, "Application Number");
              const fatherName = getValue(details, "Father's Name");
              const motherName = getValue(details, "Mother's Name");
              const guardianName = admission.guardian_name || getValue(details, "Guardian Name");
              const guardianRelation = getValue(details, "Guardian Relationship");
              const mobileOne = admission.mobile || getValue(details, "Mobile Number 1");
              const mobileTwo = getValue(details, "Mobile Number 2");
              const occupation = getValue(details, "Parent Occupation");
              const previousEducation = getValue(details, "Previous Education");
              const address = getValue(details, "Address");
              const village = getValue(details, "Village / Town");
              const postOffice = getValue(details, "Post Office");
              const district = getValue(details, "District");
              const state = getValue(details, "State");
              const pinCode = getValue(details, "PIN Code");
              const country = getValue(details, "Country");
              const identityProofType = getValue(details, "Identity Proof Type");
              const photoPath = details["Student Photo"];
              const identityPath = details["Identity Proof"];
              const photoUrl = getFileUrl(photoPath);
              const identityUrl = getFileUrl(identityPath);
              const whatsappPhone = cleanPhoneNumber(mobileOne);
              const isPrinting = printingId === admission.id;

              return (
                <article
                  key={admission.id}
                  className={`admission-card overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ${
                    printingId && !isPrinting ? "print-muted" : ""
                  } ${isPrinting ? "print-target" : ""}`}
                >
                  <div className="print-hidden border-b border-gray-200 bg-slate-50 px-5 py-4 sm:px-7">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                          <FiUser className="text-xl" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-black uppercase tracking-[1.4px] text-emerald-700">
                              Application
                            </p>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getStatusClasses(admission.status)}`}>
                              {getStatusLabel(admission.status)}
                            </span>
                          </div>
                          <h3 className="mt-1 truncate text-xl font-black text-slate-900 sm:text-2xl">
                            {admission.student_name || "Student Name Not Provided"}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-gray-500">
                            Received {formatDate(admission.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {mobileOne ? (
                          <a
                            href={`tel:${cleanPhoneNumber(mobileOne)}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-100"
                          >
                            <FiPhone /> Call
                          </a>
                        ) : null}
                        {whatsappPhone ? (
                          <a
                            href={`https://wa.me/${whatsappPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-3.5 py-2.5 text-sm font-black text-green-700 transition hover:bg-green-100"
                          >
                            <FiMessageCircle /> WhatsApp
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => printAdmission(admission.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
                        >
                          <FiPrinter /> Print
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAdmission(admission.id)}
                          disabled={deletingId === admission.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <FiTrash2 />
                          {deletingId === admission.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-b-4 border-emerald-800 bg-white px-5 py-7 sm:px-8 lg:px-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[4px] text-emerald-700 sm:text-xs">
                          Official Admission Record
                        </p>
                        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
                          Madrasa Majmaul Bahrain Bijol
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-gray-500 sm:text-sm">
                          Bijol, Madhepura, Bihar - 854317
                        </p>
                        <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-emerald-800 sm:mx-0" />
                        <p className="mt-4 text-sm font-black uppercase tracking-[2px] text-emerald-900">
                          Admission Application Form
                        </p>
                      </div>

                      <div className="mx-auto w-[128px] shrink-0 sm:mx-0 sm:w-[145px]">
                        <div className="aspect-[4/5] overflow-hidden rounded-xl border-2 border-emerald-800 bg-gray-100 shadow-sm">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={`${admission.student_name || "Student"} photo`}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                              <FiUser className="text-3xl" />
                              <span className="text-center text-[10px] font-bold uppercase">Photo unavailable</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Student Photograph
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 border-t border-gray-200 pt-5 sm:grid-cols-3">
                      <Field label="Application Number" value={applicationNumber} icon={<FiFileText />} highlight />
                      <Field label="Received On" value={formatDate(admission.created_at)} icon={<FiClock />} />
                      <Field label="Current Status" value={getStatusLabel(admission.status)} icon={<FiCheckCircle />} highlight={admission.status === "approved"} />
                    </div>
                  </div>

                  <div className="p-5 sm:p-7 lg:p-8">
                    <section className="overflow-hidden rounded-2xl border border-gray-200">
                      <SectionTitle number="01" title="Student Information" subtitle="Basic student details" />
                      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
                        <Field label="Student Name" value={admission.student_name || "—"} icon={<FiUser />} />
                        <Field label="Date of Birth" value={formatDob(admission.date_of_birth)} icon={<FiCalendar />} />
                        <Field label="Previous Education" value={previousEducation} icon={<FiBookOpen />} />
                        <Field label="Course / Program" value={admission.course || "—"} icon={<FiBookOpen />} highlight />
                      </div>
                    </section>

                    <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                      <SectionTitle number="02" title="Parent / Guardian Information" subtitle="Family and contact details" />
                      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
                        <Field label="Father's Name" value={fatherName} icon={<FiUser />} />
                        <Field label="Mother's Name" value={motherName} icon={<FiUser />} />
                        <Field label="Guardian Name" value={guardianName || "—"} icon={<FiUsers />} />
                        <Field label="Relationship" value={guardianRelation} icon={<FiUsers />} />
                        <Field label="Mobile Number 1" value={mobileOne || "—"} icon={<FiPhone />} />
                        <Field label="Mobile Number 2" value={mobileTwo} icon={<FiPhone />} />
                        <Field label="Parent Occupation" value={occupation} icon={<FiUser />} />
                        <Field label="Email" value={admission.email || "—"} icon={<FiMail />} />
                      </div>
                    </section>

                    <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                      <SectionTitle number="03" title="Address Information" subtitle="Residential address provided in the application" />
                      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
                        <div className="sm:col-span-2 lg:col-span-4">
                          <Field label="Full Address" value={address} icon={<FiMapPin />} />
                        </div>
                        <Field label="Village / Town" value={village} />
                        <Field label="Post Office" value={postOffice} />
                        <Field label="District" value={district} />
                        <Field label="State" value={state} />
                        <Field label="PIN Code" value={pinCode} />
                        <Field label="Country" value={country} />
                      </div>
                    </section>

                    <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                      <SectionTitle number="04" title="Course Selection" subtitle="Programme selected by the applicant" />
                      <div className="p-4 sm:p-5">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                          <p className="text-[11px] font-black uppercase tracking-[1.5px] text-emerald-700">Selected Course / Programme</p>
                          <p className="mt-2 text-xl font-black text-emerald-900">{admission.course || "—"}</p>
                        </div>
                      </div>
                    </section>

                    <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                      <SectionTitle number="05" title="Documents & Verification" subtitle="Submitted photo and identity proof" />
                      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                              <FiUser />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-gray-500">Student Photo</p>
                              <p className="mt-1 text-sm font-bold text-gray-900">{photoPath ? "Uploaded" : "Not available"}</p>
                            </div>
                          </div>
                          {photoUrl ? (
                            <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block overflow-hidden rounded-xl border border-gray-200 bg-white">
                              <img src={photoUrl} alt="Student document preview" className="h-44 w-full object-contain" />
                            </a>
                          ) : null}
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                                <FiFileText />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide text-gray-500">Identity Proof</p>
                                <p className="mt-1 text-sm font-bold text-gray-900">{identityProofType}</p>
                              </div>
                            </div>
                            {identityUrl ? (
                              <a href={identityUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50">
                                View
                              </a>
                            ) : null}
                          </div>
                          <p className="mt-4 break-all rounded-xl bg-white p-3 text-xs font-medium leading-5 text-gray-500">
                            {identityPath || "Identity proof file not available."}
                          </p>
                        </div>
                      </div>
                    </section>

                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-black">Verification Note</p>
                      <p className="mt-1 leading-6">
                        Please verify the student information and submitted documents before approving this application.
                      </p>
                    </div>

                    <div className="print-hidden mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[1.5px] text-gray-500">Application action</p>
                        <p className="mt-1 text-sm font-bold text-gray-800">Update the application status after verification.</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {admission.status !== "under_review" ? (
                          <button
                            type="button"
                            disabled={updatingId === admission.id}
                            onClick={() => updateStatus(admission.id, "under_review")}
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-black text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            <FiClock /> Review
                          </button>
                        ) : null}
                        {admission.status !== "approved" ? (
                          <button
                            type="button"
                            disabled={updatingId === admission.id}
                            onClick={() => updateStatus(admission.id, "approved")}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-50"
                          >
                            <FiCheckCircle /> Approve
                          </button>
                        ) : null}
                        {admission.status !== "rejected" ? (
                          <button
                            type="button"
                            disabled={updatingId === admission.id}
                            onClick={() => updateStatus(admission.id, "rejected")}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <FiXCircle /> Reject
                          </button>
                        ) : null}
                        <div className="relative">
                          <select
                            value={admission.status}
                            disabled={updatingId === admission.id}
                            onChange={(event) => updateStatus(admission.id, event.target.value as AdmissionStatus)}
                            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-black text-gray-700 outline-none focus:border-emerald-500"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
