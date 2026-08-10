"use client";

import { useEffect, useState } from "react";
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
  status: string | null;
  created_at: string | null;
};

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAdmissions() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/admin";
          return;
        }

        const { data, error } = await supabase
          .from("admissions")
          .select(
            "id, student_name, guardian_name, mobile, email, course, message, status, created_at"
          )
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setAdmissions(data || []);
      } catch (error) {
        console.error("Admissions loading error:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Admission applications load nahi ho sakin."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadAdmissions();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
              Admission Applications
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TOP INFO */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-800 to-green-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-green-100">
            Online Admissions
          </p>

          <h2 className="mt-1 text-2xl font-extrabold">
            All Admission Applications
          </h2>

          <p className="mt-2 text-sm text-green-100">
            Total applications received:{" "}
            <span className="font-bold text-white">
              {admissions.length}
            </span>
          </p>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">
              ❌ Error loading admissions
            </p>

            <p className="mt-1 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />

            <p className="mt-4 font-semibold text-gray-600">
              Loading admission applications...
            </p>
          </div>
        ) : admissions.length === 0 ? (
          /* EMPTY */
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">📋</div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No Admission Applications
            </h3>

            <p className="mt-2 text-gray-500">
              Abhi tak koi admission application receive nahi hui.
            </p>
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      #
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      Guardian
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      Mobile
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      Course
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {admissions.map((admission, index) => (
                    <tr
                      key={admission.id}
                      className="transition hover:bg-green-50"
                    >
                      <td className="px-5 py-5 text-sm font-semibold text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-bold text-gray-900">
                          {admission.student_name || "—"}
                        </p>

                        {admission.message && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {admission.message}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-700">
                        {admission.guardian_name || "—"}
                      </td>

                      <td className="px-5 py-5 text-sm font-semibold text-gray-700">
                        {admission.mobile || "—"}
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                          {admission.course || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-700">
                        {admission.email || "—"}
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                          {admission.status || "New"}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-600">
                        {admission.created_at
                          ? new Date(
                              admission.created_at
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
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
