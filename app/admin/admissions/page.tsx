"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

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
  {
    value: "new",
    label: "New",
  },
  {
    value: "under_review",
    label: "Under Review",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
];

function getStatusLabel(status: AdmissionStatus) {
  switch (status) {
    case "new":
      return "New";

    case "under_review":
      return "Under Review";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    default:
      return "New";
  }
}

function getStatusClasses(status: AdmissionStatus) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200";

    case "under_review":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";

    case "approved":
      return "bg-green-100 text-green-800 border-green-200";

    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";

    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "Date not available";
  }

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
    return "Date not available";
  }
}

function cleanPhoneNumber(phone: string | null) {
  if (!phone) {
    return "";
  }

  return phone.replace(/\D/g, "");
}

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [courseFilter, setCourseFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState<
    "all" | AdmissionStatus
  >("all");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  async function loadAdmissions() {
    setLoading(true);
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admissions query error:", error);
        throw new Error(error.message);
      }

      setAdmissions((data || []) as Admission[]);
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

      setTimeout(() => {
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
    const confirmed = window.confirm(
      "Kya aap is admission application ko permanently delete karna chahte hain?"
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

      setSuccessMessage("Admission application deleted successfully.");

      setTimeout(() => {
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

  useEffect(() => {
    loadAdmissions();
  }, []);

  const courses = useMemo(() => {
    const uniqueCourses = admissions
      .map((admission) => admission.course)
      .filter(
        (course): course is string =>
          Boolean(course && course.trim())
      );

    return Array.from(new Set(uniqueCourses)).sort();
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

  function clearFilters() {
    setSearchTerm("");
    setCourseFilter("all");
    setStatusFilter("all");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[2px] text-green-700 sm:text-sm">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h1 className="mt-1 truncate text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Admission Applications
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="shrink-0 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-800 sm:px-5"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* HERO */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-green-950 via-green-800 to-green-600 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="font-semibold uppercase tracking-[3px] text-green-200">
                Online Admissions
              </p>

              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                All Admission Applications
              </h2>

              <p className="mt-3 text-green-100 sm:text-lg">
                Total applications received:{" "}
                <span className="font-extrabold text-white">
                  {admissions.length}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdmissions}
              disabled={loading}
              className="w-full rounded-xl bg-white px-6 py-3 font-bold text-green-700 shadow-lg transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* STATUS SUMMARY */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setStatusFilter("new")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              statusFilter === "new"
                ? "border-blue-400 ring-2 ring-blue-100"
                : "border-gray-100"
            }`}
          >
            <p className="text-sm font-semibold text-gray-500">
              New
            </p>

            <p className="mt-1 text-3xl font-extrabold text-blue-700">
              {newCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("under_review")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              statusFilter === "under_review"
                ? "border-yellow-400 ring-2 ring-yellow-100"
                : "border-gray-100"
            }`}
          >
            <p className="text-sm font-semibold text-gray-500">
              Under Review
            </p>

            <p className="mt-1 text-3xl font-extrabold text-yellow-700">
              {reviewCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              statusFilter === "approved"
                ? "border-green-400 ring-2 ring-green-100"
                : "border-gray-100"
            }`}
          >
            <p className="text-sm font-semibold text-gray-500">
              Approved
            </p>

            <p className="mt-1 text-3xl font-extrabold text-green-700">
              {approvedCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              statusFilter === "rejected"
                ? "border-red-400 ring-2 ring-red-100"
                : "border-gray-100"
            }`}
          >
            <p className="text-sm font-semibold text-gray-500">
              Rejected
            </p>

            <p className="mt-1 text-3xl font-extrabold text-red-700">
              {rejectedCount}
            </p>
          </button>
        </div>

        {/* SUCCESS */}
        {successMessage && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800 shadow-sm">
            <p className="font-bold">
              ✅ {successMessage}
            </p>
          </div>
        )}

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <p className="font-bold">
              ❌ Error
            </p>

            <p className="mt-2 break-words text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        {/* FILTERS */}
        {!loading && admissions.length > 0 && (
          <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end">
              {/* SEARCH */}
              <div>
                <label className="text-sm font-bold text-gray-700">
                  Search Applications
                </label>

                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                    🔎
                  </span>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search student, guardian, mobile, email..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* COURSE */}
              <div>
                <label className="text-sm font-bold text-gray-700">
                  Filter by Course
                </label>

                <select
                  value={courseFilter}
                  onChange={(event) =>
                    setCourseFilter(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
                <label className="text-sm font-bold text-gray-700">
                  Filter by Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "all"
                        | AdmissionStatus
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
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

              {/* CLEAR */}
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-extrabold text-gray-900">
                  {filteredAdmissions.length}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-gray-900">
                  {admissions.length}
                </span>{" "}
                applications
              </p>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-16 text-center shadow-sm">
            <div className="text-5xl">
              ⏳
            </div>

            <h3 className="mt-5 text-2xl font-bold text-gray-900">
              Loading Applications...
            </h3>

            <p className="mt-2 text-gray-500">
              Please wait while admission applications are loaded.
            </p>
          </div>
        )}

        {/* NO DATA */}
        {!loading &&
          !errorMessage &&
          admissions.length === 0 && (
            <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm sm:p-16">
              <div className="text-6xl">
                📋
              </div>

              <h3 className="mt-6 text-2xl font-extrabold text-gray-900">
                No Admission Applications
              </h3>

              <p className="mt-3 text-gray-500">
                Abhi tak koi admission application receive nahi hui.
              </p>
            </div>
          )}

        {/* NO FILTER RESULT */}
        {!loading &&
          admissions.length > 0 &&
          filteredAdmissions.length === 0 && (
            <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">
                🔎
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
                No Matching Applications
              </h3>

              <p className="mt-2 text-gray-500">
                Search ya filters change karke dobara try karein.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* APPLICATIONS */}
        {!loading &&
          filteredAdmissions.length > 0 && (
            <div className="mt-8 space-y-6">
              {filteredAdmissions.map(
                (admission, index) => {
                  const phone =
                    cleanPhoneNumber(admission.mobile);

                  const whatsappPhone =
                    phone.length === 10
                      ? `91${phone}`
                      : phone;

                  return (
                    <article
                      key={admission.id}
                      className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100 transition hover:shadow-xl"
                    >
                      {/* CARD HEADER */}
                      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-6 sm:px-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                              🎓
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-extrabold uppercase tracking-wide text-green-700">
                                  Application #
                                  {admissions.length -
                                    admissions.findIndex(
                                      (item) =>
                                        item.id ===
                                        admission.id
                                    )}
                                </p>

                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-extrabold ${getStatusClasses(
                                    admission.status
                                  )}`}
                                >
                                  {getStatusLabel(
                                    admission.status
                                  )}
                                </span>
                              </div>

                              <h3 className="mt-1 truncate text-2xl font-extrabold text-gray-900 sm:text-3xl">
                                {admission.student_name ||
                                  "Student Name Not Provided"}
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                Received:{" "}
                                <span className="font-bold text-gray-700">
                                  {formatDate(
                                    admission.created_at
                                  )}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* CONTACT BUTTONS */}
                          <div className="flex flex-wrap gap-2">
                            {phone && (
                              <a
                                href={`tel:${phone}`}
                                className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100"
                              >
                                📞 Call
                              </a>
                            )}

                            {phone && (
                              <a
                                href={`https://wa.me/${whatsappPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-extrabold text-green-700 transition hover:bg-green-100"
                              >
                                💬 WhatsApp
                              </a>
                            )}

                            {admission.email && (
                              <a
                                href={`mailto:${admission.email}`}
                                className="rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-extrabold text-purple-700 transition hover:bg-purple-100"
                              >
                                ✉️ Email
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="px-5 py-6 sm:px-8">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {/* STUDENT */}
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Student Name
                            </p>

                            <p className="mt-2 font-extrabold text-gray-900">
                              {admission.student_name ||
                                "—"}
                            </p>
                          </div>

                          {/* GUARDIAN */}
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Father / Guardian
                            </p>

                            <p className="mt-2 font-extrabold text-gray-900">
                              {admission.guardian_name ||
                                "—"}
                            </p>
                          </div>

                          {/* MOBILE */}
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Mobile Number
                            </p>

                            <p className="mt-2 font-extrabold text-gray-900">
                              {admission.mobile || "—"}
                            </p>
                          </div>

                          {/* EMAIL */}
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Email
                            </p>

                            <p className="mt-2 break-all font-extrabold text-gray-900">
                              {admission.email || "—"}
                            </p>
                          </div>

                          {/* COURSE */}
                          <div className="rounded-2xl bg-green-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Course / Program
                            </p>

                            <p className="mt-2 font-extrabold text-green-700">
                              {admission.course || "—"}
                            </p>
                          </div>

                          {/* APPLICATION ID */}
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Application ID
                            </p>

                            <p className="mt-2 break-all text-xs font-medium text-gray-700">
                              {admission.id}
                            </p>
                          </div>
                        </div>

                        {/* MESSAGE */}
                        <div className="mt-5">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Additional Message
                          </p>

                          <div className="mt-2 rounded-2xl bg-gray-50 p-5 leading-7 text-gray-700">
                            {admission.message ||
                              "No additional message."}
                          </div>
                        </div>

                        {/* STATUS CONTROL */}
                        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-sm font-extrabold text-gray-900">
                                Application Status
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Status change database mein automatically save hoga.
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
                                className={`rounded-xl border px-4 py-3 text-sm font-extrabold outline-none transition focus:ring-2 focus:ring-green-100 ${getStatusClasses(
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
                                <div className="flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-600">
                                  Saving...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* QUICK STATUS BUTTONS */}
                        <div className="mt-4 flex flex-wrap gap-2">
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
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
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
                            className="rounded-lg bg-yellow-50 px-3 py-2 text-xs font-extrabold text-yellow-700 transition hover:bg-yellow-100 disabled:opacity-50"
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
                            className="rounded-lg bg-green-50 px-3 py-2 text-xs font-extrabold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
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
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
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
                            className="ml-auto rounded-lg bg-gray-100 px-3 py-2 text-xs font-extrabold text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          >
                            {deletingId ===
                            admission.id
                              ? "Deleting..."
                              : "🗑️ Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
      </section>
    </main>
  );
}
