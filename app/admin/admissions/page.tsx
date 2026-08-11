"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

type Admission = {
  id: string;
  student_name: string | null;
  guardian_name: string | null;
  mobile: string | null;
  email: string | null;
  course: string | null;
  message: string | null;
  created_at: string | null;
};

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");

  async function loadAdmissions() {
    setLoading(true);
    setErrorMessage("");

    try {
      // Check logged-in user
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

      // Fetch admissions
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
          created_at
          `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admissions query error:", error);
        throw new Error(error.message);
      }

      setAdmissions(data || []);
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

  useEffect(() => {
    loadAdmissions();
  }, []);

  // Unique courses
  const courses = useMemo(() => {
    const uniqueCourses = admissions
      .map((item) => item.course)
      .filter((course): course is string => Boolean(course));

    return ["All Courses", ...Array.from(new Set(uniqueCourses))];
  }, [admissions]);

  // Search + filter
  const filteredAdmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return admissions.filter((admission) => {
      const matchesSearch =
        !search ||
        admission.student_name?.toLowerCase().includes(search) ||
        admission.guardian_name?.toLowerCase().includes(search) ||
        admission.mobile?.toLowerCase().includes(search) ||
        admission.email?.toLowerCase().includes(search) ||
        admission.course?.toLowerCase().includes(search);

      const matchesCourse =
        courseFilter === "All Courses" ||
        admission.course === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [admissions, searchTerm, courseFilter]);

  function formatDate(dateString: string | null) {
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
    });
  }

  function getWhatsAppLink(mobile: string | null) {
    if (!mobile) return "#";

    const cleanNumber = mobile.replace(/\D/g, "");

    // India number
    if (cleanNumber.length === 10) {
      return `https://wa.me/91${cleanNumber}`;
    }

    if (cleanNumber.startsWith("91") && cleanNumber.length === 12) {
      return `https://wa.me/${cleanNumber}`;
    }

    return `https://wa.me/${cleanNumber}`;
  }

  function getCallLink(mobile: string | null) {
    if (!mobile) return "#";

    return `tel:${mobile.replace(/\s+/g, "")}`;
  }

  function getMailLink(email: string | null) {
    if (!email) return "#";

    return `mailto:${email}`;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-green-700 sm:text-sm">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h1 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-3xl">
              Admission Applications
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="shrink-0 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-green-800 sm:px-5 sm:py-3"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* HERO */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-950 via-green-800 to-green-600 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-300/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[3px] text-green-100">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                Online Admissions
              </div>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                All Admission
                <br className="hidden sm:block" />
                Applications
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-green-100 sm:text-base">
                Manage and review all online admission applications received
                by the madrasa.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-200">
                  Total Applications
                </p>

                <p className="mt-1 text-4xl font-extrabold">
                  {admissions.length}
                </p>
              </div>

              <button
                type="button"
                onClick={loadAdmissions}
                disabled={loading}
                className="rounded-xl bg-white px-6 py-3 font-bold text-green-700 shadow-lg transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "↻ Refresh Applications"}
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <p className="font-bold">❌ Error loading admissions</p>

            <p className="mt-2 text-sm">{errorMessage}</p>

            <button
              type="button"
              onClick={loadAdmissions}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-16 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

            <h3 className="mt-6 text-2xl font-bold text-gray-900">
              Loading Applications...
            </h3>

            <p className="mt-2 text-gray-500">
              Please wait while admission applications are loaded.
            </p>
          </div>
        )}

        {/* SEARCH + FILTER */}
        {!loading && !errorMessage && admissions.length > 0 && (
          <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              {/* SEARCH */}
              <div className="flex-1">
                <label
                  htmlFor="admission-search"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Search Applications
                </label>

                <div className="relative">
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
                    placeholder="Search student, guardian, mobile, email..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* COURSE FILTER */}
              <div className="w-full lg:w-64">
                <label
                  htmlFor="course-filter"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Filter by Course
                </label>

                <select
                  id="course-filter"
                  value={courseFilter}
                  onChange={(event) =>
                    setCourseFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLEAR */}
              {(searchTerm || courseFilter !== "All Courses") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCourseFilter("All Courses");
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
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

              {searchTerm && (
                <p className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  Search: "{searchTerm}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* NO DATA */}
        {!loading &&
          !errorMessage &&
          admissions.length === 0 && (
            <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm sm:p-16">
              <div className="text-6xl">📋</div>

              <h3 className="mt-6 text-2xl font-extrabold text-gray-900">
                No Admission Applications
              </h3>

              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Abhi tak koi admission application receive nahi hui.
              </p>

              <button
                type="button"
                onClick={loadAdmissions}
                className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-bold text-white shadow-md hover:bg-green-800"
              >
                ↻ Refresh
              </button>
            </div>
          )}

        {/* FILTERED NO RESULTS */}
        {!loading &&
          !errorMessage &&
          admissions.length > 0 &&
          filteredAdmissions.length === 0 && (
            <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">🔎</div>

              <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
                No Matching Applications
              </h3>

              <p className="mt-2 text-gray-500">
                Search ya course filter change karke dobara try karein.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCourseFilter("All Courses");
                }}
                className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* APPLICATIONS */}
        {!loading &&
          !errorMessage &&
          filteredAdmissions.length > 0 && (
            <div className="mt-8 space-y-6">
              {filteredAdmissions.map((admission, index) => (
                <article
                  key={admission.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100 transition hover:shadow-xl"
                >
                  {/* CARD HEADER */}
                  <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-5 sm:px-8">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl">
                          🎓
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-green-700">
                              Application #{admissions.length - index}
                            </p>

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                              New Application
                            </span>
                          </div>

                          <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
                            {admission.student_name ||
                              "Student Name Not Provided"}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Received:{" "}
                            <span className="font-semibold text-gray-700">
                              {formatDate(admission.created_at)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* QUICK ACTIONS */}
                      <div className="flex flex-wrap gap-2">
                        {admission.mobile && (
                          <>
                            <a
                              href={getCallLink(admission.mobile)}
                              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                            >
                              📞 Call
                            </a>

                            <a
                              href={getWhatsAppLink(admission.mobile)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-100"
                            >
                              💬 WhatsApp
                            </a>
                          </>
                        )}

                        {admission.email && (
                          <a
                            href={getMailLink(admission.email)}
                            className="rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 transition hover:bg-purple-100"
                          >
                            ✉ Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="grid gap-6 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
                    {/* STUDENT */}
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Student Name
                      </p>

                      <p className="mt-2 font-bold text-gray-900">
                        {admission.student_name || "—"}
                      </p>
                    </div>

                    {/* GUARDIAN */}
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Father / Guardian
                      </p>

                      <p className="mt-2 font-bold text-gray-900">
                        {admission.guardian_name || "—"}
                      </p>
                    </div>

                    {/* MOBILE */}
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Mobile Number
                      </p>

                      <p className="mt-2 font-bold text-gray-900">
                        {admission.mobile || "—"}
                      </p>
                    </div>

                    {/* EMAIL */}
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Email
                      </p>

                      <p className="mt-2 break-all font-bold text-gray-900">
                        {admission.email || "—"}
                      </p>
                    </div>

                    {/* COURSE */}
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                        Course / Program
                      </p>

                      <p className="mt-2 font-extrabold text-green-800">
                        {admission.course || "—"}
                      </p>
                    </div>

                    {/* DATE */}
                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Application Received
                      </p>

                      <p className="mt-2 font-bold text-blue-900">
                        {formatDate(admission.created_at)}
                      </p>
                    </div>

                    {/* APPLICATION ID */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Application ID
                      </p>

                      <div className="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="break-all font-mono text-xs font-medium text-gray-600 sm:text-sm">
                          {admission.id}
                        </p>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Additional Message
                      </p>

                      <div className="mt-2 rounded-2xl border border-gray-100 bg-gray-50 p-5 leading-7 text-gray-700">
                        {admission.message ||
                          "No additional message provided."}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
