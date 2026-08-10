"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdmissions = useCallback(async () => {
    try {
      setErrorMessage("");

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
          "id, student_name, guardian_name, mobile, email, course, message, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase admissions error:", error);
        throw new Error(error.message);
      }

      setAdmissions(data || []);
    } catch (error) {
      console.error("Fetch admissions error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Admissions data load nahi ho saka. Please dobara try karein."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAdmissions();
  }

  function formatDate(date: string | null) {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold text-green-700">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Admission Applications
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* GREEN SUMMARY */}
        <div className="rounded-3xl bg-gradient-to-r from-green-900 via-green-800 to-green-600 p-7 text-white shadow-xl sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[3px] text-green-200">
            Online Admissions
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                All Admission Applications
              </h2>

              <p className="mt-3 text-green-100">
                Total applications received:
                <span className="ml-2 text-xl font-extrabold text-white">
                  {admissions.length}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl bg-white px-5 py-3 font-bold text-green-800 shadow-md transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <p className="font-extrabold">❌ Admission data load error</p>

            <p className="mt-2 text-sm">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />

            <p className="mt-5 font-semibold text-gray-600">
              Loading admission applications...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !errorMessage && admissions.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-14 text-center shadow-sm ring-1 ring-gray-100">
            <div className="text-6xl">📋</div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              No Admission Applications
            </h3>

            <p className="mt-3 text-gray-500">
              Abhi tak koi admission application receive nahi hui.
            </p>
          </div>
        )}

        {/* ADMISSIONS TABLE */}
        {!loading && admissions.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-100">
            <div className="border-b border-gray-200 px-6 py-5">
              <h3 className="text-xl font-extrabold text-gray-900">
                Received Applications
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Latest applications are shown first.
              </p>
            </div>

            {/* MOBILE CARDS */}
            <div className="divide-y divide-gray-200 md:hidden">
              {admissions.map((admission) => (
                <div key={admission.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-extrabold text-gray-900">
                        {admission.student_name || "—"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Guardian: {admission.guardian_name || "—"}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                      {admission.course || "Course not selected"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-bold">📱 Mobile:</span>{" "}
                      {admission.mobile || "—"}
                    </p>

                    <p>
                      <span className="font-bold">📧 Email:</span>{" "}
                      {admission.email || "—"}
                    </p>

                    <p>
                      <span className="font-bold">📅 Submitted:</span>{" "}
                      {formatDate(admission.created_at)}
                    </p>
                  </div>

                  {admission.message && (
                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        Message
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {admission.message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-gray-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-gray-500">
                      Guardian
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-gray-500">
                      Mobile
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-gray-500">
                      Course
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-gray-500">
                      Submitted
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {admissions.map((admission) => (
                    <tr
                      key={admission.id}
                      className="transition hover:bg-green-50/50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">
                          {admission.student_name || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {admission.guardian_name || "—"}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                        {admission.mobile || "—"}
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                          {admission.course || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {admission.email || "—"}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-500">
                        {formatDate(admission.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
