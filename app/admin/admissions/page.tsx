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
};

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadAdmissions() {
    setLoading(true);
    setErrorMessage("");

    try {
      // Check logged-in admin
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

      // Fetch admission applications
      const { data, error } = await supabase
        .from("admissions")
        .select(
          "id, student_name, guardian_name, mobile, email, course, message"
        )
        .order("id", { ascending: false });

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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
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
            className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* HERO */}
        <div className="rounded-3xl bg-gradient-to-r from-green-950 via-green-800 to-green-600 p-8 text-white shadow-xl sm:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="font-semibold uppercase tracking-[4px] text-green-200">
                Online Admissions
              </p>

              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                All Admission Applications
              </h2>

              <p className="mt-4 text-lg text-green-100">
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
              className="rounded-xl bg-white px-6 py-3 font-bold text-green-700 shadow-lg transition hover:bg-green-50 disabled:opacity-60"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <p className="font-bold">❌ Error loading admissions</p>

            <p className="mt-2 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-16 text-center shadow-sm">
            <div className="text-5xl">⏳</div>

            <h3 className="mt-5 text-2xl font-bold text-gray-900">
              Loading Applications...
            </h3>

            <p className="mt-2 text-gray-500">
              Please wait while admission applications are loaded.
            </p>
          </div>
        )}

        {/* NO DATA */}
        {!loading && !errorMessage && admissions.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-16 text-center shadow-sm">
            <div className="text-6xl">📋</div>

            <h3 className="mt-6 text-2xl font-extrabold text-gray-900">
              No Admission Applications
            </h3>

            <p className="mt-3 text-gray-500">
              Abhi tak koi admission application receive nahi hui.
            </p>
          </div>
        )}

        {/* APPLICATIONS */}
        {!loading && admissions.length > 0 && (
          <div className="mt-8 space-y-6">
            {admissions.map((admission, index) => (
              <div
                key={admission.id}
                className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100"
              >
                {/* CARD HEADER */}
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Application #{admissions.length - index}
                    </p>

                    <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
                      {admission.student_name || "Student Name Not Provided"}
                    </h3>
                  </div>

                  <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
                    New Application
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
                  {/* STUDENT */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Student Name
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {admission.student_name || "—"}
                    </p>
                  </div>

                  {/* GUARDIAN */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Father / Guardian
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {admission.guardian_name || "—"}
                    </p>
                  </div>

                  {/* MOBILE */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Mobile Number
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {admission.mobile || "—"}
                    </p>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all font-bold text-gray-900">
                      {admission.email || "—"}
                    </p>
                  </div>

                  {/* COURSE */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Course / Program
                    </p>

                    <p className="mt-1 font-bold text-green-700">
                      {admission.course || "—"}
                    </p>
                  </div>

                  {/* ID */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Application ID
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-700">
                      {admission.id}
                    </p>
                  </div>

                  {/* MESSAGE */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-sm font-semibold text-gray-500">
                      Additional Message
                    </p>

                    <div className="mt-2 rounded-2xl bg-gray-50 p-5 text-gray-700">
                      {admission.message || "No additional message."}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
