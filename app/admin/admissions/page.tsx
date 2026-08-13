"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase/client";

type AdmissionStatus =
  | "new"
  | "under_review"
  | "approved"
  | "rejected";

type Admission = {
  id: string;
  student_name: string | null;
  guardian_name: string | null;
  mobile: string | null;
  email: string | null;
  course: string | null;
  message: string | null;
  status: AdmissionStatus;
  created_at: string;
};

const statusOptions: {
  value: AdmissionStatus;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function getStatusLabel(status: AdmissionStatus) {
  const found = statusOptions.find((item) => item.value === status);
  return found?.label || "New";
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

function getStatusDot(status: AdmissionStatus) {
  switch (status) {
    case "new":
      return "bg-blue-500";

    case "under_review":
      return "bg-amber-500";

    case "approved":
      return "bg-emerald-500";

    case "rejected":
      return "bg-red-500";

    default:
      return "bg-gray-400";
  }
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "Date not available";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function cleanPhoneNumber(phone: string | null) {
  if (!phone) {
    return "";
  }

  return phone.replace(/\D/g, "");
}

function getWhatsAppNumber(phone: string | null) {
  const cleaned = cleanPhoneNumber(phone);

  if (!cleaned) {
    return "";
  }

  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return cleaned;
  }

  return cleaned;
}

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [courseFilter, setCourseFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState<
    "all" | AdmissionStatus
  >("all");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadAdmissions(showRefreshState = false) {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

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
            status,
            created_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Admissions query error:", error);
        throw new Error(error.message);
      }

      const cleanedData: Admission[] = (data || []).map((item) => ({
        id: item.id,
        student_name: item.student_name ?? null,
        guardian_name: item.guardian_name ?? null,
        mobile: item.mobile ?? null,
        email: item.email ?? null,
        course: item.course ?? null,
        message: item.message ?? null,
        status: (item.status || "new") as AdmissionStatus,
        created_at: item.created_at,
      }));

      setAdmissions(cleanedData);
    } catch (error) {
      console.error("Load admissions error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Admission applications load nahi ho pa rahi hain."
        );
      }

      setAdmissions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function updateStatus(
    admissionId: string,
    newStatus: AdmissionStatus
  ) {
    if (updatingId) {
      return;
    }

    setUpdatingId(admissionId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("admissions")
        .update({
          status: newStatus,
        })
        .eq("id", admissionId);

      if (error) {
        console.error("Status update error:", error);
        throw new Error(error.message);
      }

      setAdmissions((currentAdmissions) =>
        currentAdmissions.map((admission) =>
          admission.id === admissionId
            ? {
                ...admission,
                status: newStatus,
              }
            : admission
        )
      );

      setSuccessMessage(
        `Application status changed to "${getStatusLabel(
          newStatus
        )}".`
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Update status error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Status update nahi ho pa raha hai.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteAdmission(admissionId: string) {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      "Kya aap is admission application ko permanently delete karna chahte hain?\n\nYe action undo nahi kiya ja sakta."
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(admissionId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("admissions")
        .delete()
        .eq("id", admissionId);

      if (error) {
        console.error("Delete admission error:", error);
        throw new Error(error.message);
      }

      setAdmissions((currentAdmissions) =>
        currentAdmissions.filter(
          (admission) => admission.id !== admissionId
        )
      );

      if (expandedId === admissionId) {
        setExpandedId(null);
      }

      setSuccessMessage(
        "Admission application deleted successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Delete admission error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Admission application delete nahi ho pa rahi hai."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setCourseFilter("all");
    setStatusFilter("all");
  }

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  useEffect(() => {
    loadAdmissions();
  }, []);

  const courses = useMemo(() => {
    const uniqueCourses = admissions
      .map((admission) => admission.course?.trim())
      .filter(
        (course): course is string =>
          Boolean(course)
      );

    return Array.from(new Set(uniqueCourses)).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [admissions]);

  const filteredAdmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return admissions.filter((admission) => {
      const matchesSearch =
        !search ||
        admission.student_name
          ?.toLowerCase()
          .includes(search) ||
        admission.guardian_name
          ?.toLowerCase()
          .includes(search) ||
        admission.mobile
          ?.toLowerCase()
          .includes(search) ||
        admission.email
          ?.toLowerCase()
          .includes(search) ||
        admission.course
          ?.toLowerCase()
          .includes(search) ||
        admission.message
          ?.toLowerCase()
          .includes(search) ||
        admission.id
          ?.toLowerCase()
          .includes(search);

      const matchesCourse =
        courseFilter === "all" ||
        admission.course === courseFilter;

      const matchesStatus =
        statusFilter === "all" ||
        admission.status === statusFilter;

      return (
        Boolean(matchesSearch) &&
        matchesCourse &&
        matchesStatus
      );
    });
  }, [
    admissions,
    searchTerm,
    courseFilter,
    statusFilter,
  ]);

  const newCount = admissions.filter(
    (admission) => admission.status === "new"
  ).length;

  const reviewCount = admissions.filter(
    (admission) => admission.status === "under_review"
  ).length;

  const approvedCount = admissions.filter(
    (admission) => admission.status === "approved"
  ).length;

  const rejectedCount = admissions.filter(
    (admission) => admission.status === "rejected"
  ).length;

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    courseFilter !== "all" ||
    statusFilter !== "all";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-700 text-lg shadow-sm">
                🎓
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-extrabold uppercase tracking-[1.5px] text-green-700 sm:text-xs">
                  Madrasa Majmaul Bahrain Bijol
                </p>

                <h1 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                  Admission Management
                </h1>
              </div>
            </div>
          </div>

          <Link
            href="/admin/dashboard"
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:px-5 sm:py-2.5"
          >
            <span className="hidden sm:inline">
              ← Back to Dashboard
            </span>

            <span className="sm:hidden">← Back</span>
          </Link>
        </div>
      </header>

      {/* ========================================================= */}
      {/* PAGE */}
      {/* ========================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* ======================================================= */}
        {/* HERO */}
        {/* ======================================================= */}

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-950 via-green-800 to-emerald-600 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-emerald-300/10" />

          <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-white/5" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-300/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[2px] text-green-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                Online Admissions
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                All Admission Applications
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-green-100 sm:text-base">
                Yahan se madrasa ke tamam online admission
                applications ko search, review aur manage karein.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-semibold text-green-200">
                    Total Applications
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {admissions.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-semibold text-green-200">
                    New
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {newCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-semibold text-green-200">
                    Approved
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {approvedCount}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadAdmissions(true)}
              disabled={loading || refreshing}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-green-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <span
                className={
                  refreshing
                    ? "inline-block animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {refreshing ? "Refreshing..." : "Refresh Applications"}
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* STATUS SUMMARY */}
        {/* ======================================================= */}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* NEW */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                statusFilter === "new" ? "all" : "new"
              )
            }
            className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
              statusFilter === "new"
                ? "border-blue-300 ring-2 ring-blue-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                🆕
              </div>

              <span className="text-xs font-bold text-slate-400">
                Applications
              </span>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              New
            </p>

            <p className="mt-1 text-3xl font-black text-blue-700">
              {newCount}
            </p>
          </button>

          {/* REVIEW */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                statusFilter === "under_review"
                  ? "all"
                  : "under_review"
              )
            }
            className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
              statusFilter === "under_review"
                ? "border-amber-300 ring-2 ring-amber-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                🔍
              </div>

              <span className="text-xs font-bold text-slate-400">
                Applications
              </span>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Under Review
            </p>

            <p className="mt-1 text-3xl font-black text-amber-700">
              {reviewCount}
            </p>
          </button>

          {/* APPROVED */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                statusFilter === "approved"
                  ? "all"
                  : "approved"
              )
            }
            className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
              statusFilter === "approved"
                ? "border-emerald-300 ring-2 ring-emerald-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                ✅
              </div>

              <span className="text-xs font-bold text-slate-400">
                Applications
              </span>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Approved
            </p>

            <p className="mt-1 text-3xl font-black text-emerald-700">
              {approvedCount}
            </p>
          </button>

          {/* REJECTED */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                statusFilter === "rejected"
                  ? "all"
                  : "rejected"
              )
            }
            className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
              statusFilter === "rejected"
                ? "border-red-300 ring-2 ring-red-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg">
                ❌
              </div>

              <span className="text-xs font-bold text-slate-400">
                Applications
              </span>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Rejected
            </p>

            <p className="mt-1 text-3xl font-black text-red-700">
              {rejectedCount}
            </p>
          </button>
        </div>

        {/* ======================================================= */}
        {/* SUCCESS MESSAGE */}
        {/* ======================================================= */}

        {successMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              ✓
            </div>

            <div>
              <p className="font-extrabold">
                Success
              </p>

              <p className="mt-0.5 text-sm">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* ERROR MESSAGE */}
        {/* ======================================================= */}

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                !
              </div>

              <div className="min-w-0">
                <p className="font-extrabold">
                  Something went wrong
                </p>

                <p className="mt-1 break-words text-sm">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* FILTERS */}
        {/* ======================================================= */}

        {!loading && admissions.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Find Applications
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Search aur filters ka use karke application
                    quickly find karein.
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:self-auto"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_1fr]">
                {/* SEARCH */}
                <div>
                  <label
                    htmlFor="admission-search"
                    className="text-xs font-extrabold uppercase tracking-wide text-slate-500"
                  >
                    Search
                  </label>

                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔎
                    </span>

                    <input
                      id="admission-search"
                      type="text"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                      placeholder="Student, guardian, mobile, email..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* COURSE */}
                <div>
                  <label
                    htmlFor="course-filter"
                    className="text-xs font-extrabold uppercase tracking-wide text-slate-500"
                  >
                    Course
                  </label>

                  <select
                    id="course-filter"
                    value={courseFilter}
                    onChange={(event) =>
                      setCourseFilter(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
                  >
                    <option value="all">
                      All Courses
                    </option>

                    {courses.map((course) => (
                      <option
                        key={course}
                        value={course}
                      >
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label
                    htmlFor="status-filter"
                    className="text-xs font-extrabold uppercase tracking-wide text-slate-500"
                  >
                    Status
                  </label>

                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as
                          | "all"
                          | AdmissionStatus
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
                  >
                    <option value="all">
                      All Statuses
                    </option>

                    {statusOptions.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-black text-slate-900">
                    {filteredAdmissions.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-slate-900">
                    {admissions.length}
                  </span>{" "}
                  applications
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-left text-sm font-extrabold text-green-700 hover:text-green-800 sm:text-right"
                  >
                    Reset filters →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* LOADING */}
        {/* ======================================================= */}

        {loading && (
          <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
              ⏳
            </div>

            <h3 className="mt-5 text-2xl font-black text-slate-900">
              Loading Applications
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Supabase se admission applications load ki ja rahi
              hain. Please wait...
            </p>
          </div>
        )}

        {/* ======================================================= */}
        {/* NO DATA */}
        {/* ======================================================= */}

        {!loading &&
          !errorMessage &&
          admissions.length === 0 && (
            <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-4xl">
                📋
              </div>

              <h3 className="mt-6 text-2xl font-black text-slate-900">
                No Admission Applications
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Abhi tak koi admission application receive nahi
                hui. New application aane ke baad yahan show hogi.
              </p>

              <button
                type="button"
                onClick={() => loadAdmissions(true)}
                className="mt-6 rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-green-800"
              >
                ↻ Check Again
              </button>
            </div>
          )}

        {/* ======================================================= */}
        {/* NO FILTER RESULT */}
        {/* ======================================================= */}

        {!loading &&
          admissions.length > 0 &&
          filteredAdmissions.length === 0 && (
            <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🔎
              </div>

              <h3 className="mt-5 text-2xl font-black text-slate-900">
                No Matching Applications
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Search ya filters change karke dobara try karein.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-green-800"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* ======================================================= */}
        {/* APPLICATION LIST */}
        {/* ======================================================= */}

        {!loading &&
          filteredAdmissions.length > 0 && (
            <div className="mt-7 space-y-5">
              {filteredAdmissions.map(
                (admission, index) => {
                  const phone = cleanPhoneNumber(
                    admission.mobile
                  );

                  const whatsappPhone =
                    getWhatsAppNumber(admission.mobile);

                  const isExpanded =
                    expandedId === admission.id;

                  return (
                    <article
                      key={admission.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                    >
                      {/* ================================================= */}
                      {/* APPLICATION HEADER */}
                      {/* ================================================= */}

                      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 px-5 py-5 sm:px-7">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-2xl shadow-sm">
                              🎓
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-green-700">
                                  Application #
                                  {admissions.length -
                                    admissions.findIndex(
                                      (item) =>
                                        item.id ===
                                        admission.id
                                    )}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${getStatusClasses(
                                    admission.status
                                  )}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                      admission.status
                                    )}`}
                                  />

                                  {getStatusLabel(
                                    admission.status
                                  )}
                                </span>
                              </div>

                              <h3 className="mt-2 truncate text-xl font-black text-slate-900 sm:text-2xl">
                                {admission.student_name ||
                                  "Student Name Not Provided"}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Received on{" "}
                                <span className="font-bold text-slate-700">
                                  {formatDate(
                                    admission.created_at
                                  )}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* CONTACT ACTIONS */}
                          <div className="flex flex-wrap gap-2 xl:justify-end">
                            {phone && (
                              <a
                                href={`tel:${phone}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-extrabold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                              >
                                📞
                                <span>Call</span>
                              </a>
                            )}

                            {whatsappPhone && (
                              <a
                                href={`https://wa.me/${whatsappPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                              >
                                💬
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {admission.email && (
                              <a
                                href={`mailto:${admission.email}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-extrabold text-purple-700 transition hover:border-purple-300 hover:bg-purple-100"
                              >
                                ✉️
                                <span>Email</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ================================================= */}
                      {/* BASIC INFORMATION */}
                      {/* ================================================= */}

                      <div className="px-5 py-5 sm:px-7">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {/* STUDENT */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">
                              Student Name
                            </p>

                            <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
                              {admission.student_name || "—"}
                            </p>
                          </div>

                          {/* GUARDIAN */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">
                              Father / Guardian
                            </p>

                            <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
                              {admission.guardian_name || "—"}
                            </p>
                          </div>

                          {/* MOBILE */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">
                              Mobile Number
                            </p>

                            <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
                              {admission.mobile || "—"}
                            </p>
                          </div>

                          {/* EMAIL */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">
                              Email
                            </p>

                            <p className="mt-2 break-all text-sm font-extrabold text-slate-900">
                              {admission.email || "—"}
                            </p>
                          </div>

                          {/* COURSE */}
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[1.2px] text-emerald-600">
                              Course / Program
                            </p>

                            <p className="mt-2 break-words text-sm font-black text-emerald-700">
                              {admission.course || "—"}
                            </p>
                          </div>

                          {/* DATE */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">
                              Application Date
                            </p>

                            <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
                              {formatDate(
                                admission.created_at
                              )}
                            </p>
                          </div>
                        </div>

                        {/* ================================================= */}
                        {/* MESSAGE */}
                        {/* ================================================= */}

                        <div className="mt-4">
                          <p className="text-[10px] font-black uppercase tracking-[1.2px] text-slate-400">
                            Additional Message
                          </p>

                          <div
                            className={`mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700 ${
                              !isExpanded
                                ? "max-h-24 overflow-hidden"
                                : ""
                            }`}
                          >
                            {admission.message ||
                              "No additional message provided."}
                          </div>

                          {admission.message &&
                            admission.message.length > 180 && (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleExpanded(
                                    admission.id
                                  )
                                }
                                className="mt-2 text-xs font-extrabold text-green-700 hover:text-green-800"
                              >
                                {isExpanded
                                  ? "Show less ↑"
                                  : "Read full message →"}
                              </button>
                            )}
                        </div>

                        {/* ================================================= */}
                        {/* STATUS MANAGEMENT */}
                        {/* ================================================= */}

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                                  ⚙️
                                </span>

                                <p className="text-sm font-black text-slate-900">
                                  Application Status
                                </p>
                              </div>

                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                Status change automatically
                                database mein save hoga.
                              </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <select
                                value={admission.status}
                                disabled={
                                  updatingId ===
                                  admission.id
                                }
                                onChange={(event) =>
                                  updateStatus(
                                    admission.id,
                                    event.target
                                      .value as AdmissionStatus
                                  )
                                }
                                className={`rounded-xl border px-4 py-3 text-sm font-black outline-none transition focus:ring-4 focus:ring-green-50 disabled:cursor-not-allowed disabled:opacity-60 ${getStatusClasses(
                                  admission.status
                                )}`}
                              >
                                {statusOptions.map(
                                  (status) => (
                                    <option
                                      key={
                                        status.value
                                      }
                                      value={
                                        status.value
                                      }
                                    >
                                      {status.label}
                                    </option>
                                  )
                                )}
                              </select>

                              {updatingId ===
                                admission.id && (
                                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-slate-600">
                                  Saving...
                                </div>
                              )}
                            </div>
                          </div>

                          {/* QUICK ACTIONS */}
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                admission.id
                              }
                              onClick={() =>
                                updateStatus(
                                  admission.id,
                                  "new"
                                )
                              }
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              🆕 New
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                admission.id
                              }
                              onClick={() =>
                                updateStatus(
                                  admission.id,
                                  "under_review"
                                )
                              }
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              🔍 Under Review
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                admission.id
                              }
                              onClick={() =>
                                updateStatus(
                                  admission.id,
                                  "approved"
                                )
                              }
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              ✅ Approve
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                admission.id
                              }
                              onClick={() =>
                                updateStatus(
                                  admission.id,
                                  "rejected"
                                )
                              }
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              ❌ Reject
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                admission.id
                              }
                              onClick={() =>
                                deleteAdmission(
                                  admission.id
                                )
                              }
                              className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              admission.id
                                ? "Deleting..."
                                : "🗑️ Delete"}
                            </button>
                          </div>
                        </div>

                        {/* ================================================= */}
                        {/* APPLICATION ID */}
                        {/* ================================================= */}

                        <div className="mt-4 flex flex-col gap-1 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[1px] text-slate-400">
                            Application ID
                          </span>

                          <span className="break-all text-[11px] font-semibold text-slate-500">
                            {admission.id}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

        {/* ======================================================= */}
        {/* FOOTER INFO */}
        {/* ======================================================= */}

        {!loading && admissions.length > 0 && (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Total:{" "}
                <span className="font-black text-slate-800">
                  {admissions.length}
                </span>{" "}
                applications
              </p>

              <p>
                Showing:{" "}
                <span className="font-black text-slate-800">
                  {filteredAdmissions.length}
                </span>{" "}
                applications
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
