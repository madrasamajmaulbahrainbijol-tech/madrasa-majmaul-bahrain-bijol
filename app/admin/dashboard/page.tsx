"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const [admissionCount, setAdmissionCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Check logged-in admin
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/admin");
          return;
        }

        setEmail(user.email || "");

        // Get Admission Applications count
        const { count: admissionsCount, error: admissionsError } =
          await supabase
            .from("admissions")
            .select("*", { count: "exact", head: true });

        if (admissionsError) {
          console.error(
            "Admissions count error:",
            admissionsError.message
          );
        } else {
          setAdmissionCount(admissionsCount || 0);
        }

        // Get Enquiries count
        const { count: enquiriesCount, error: enquiriesError } =
          await supabase
            .from("enquiries")
            .select("*", { count: "exact", head: true });

        if (enquiriesError) {
          console.error(
            "Enquiries count error:",
            enquiriesError.message
          );
        } else {
          setEnquiryCount(enquiriesCount || 0);
        }

        // Get Students count
        const { count: studentsCount, error: studentsError } =
          await supabase
            .from("students")
            .select("*", { count: "exact", head: true });

        if (studentsError) {
          console.error(
            "Students count error:",
            studentsError.message
          );
        } else {
          setStudentCount(studentsCount || 0);
        }

        setLoading(false);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />

          <p className="mt-4 font-medium text-gray-600">
            Loading admin panel...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* WELCOME */}
        <div className="rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-green-100">
            Welcome back
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Madrasa Administration Panel
          </h2>

          <p className="mt-2 text-sm text-green-100">
            Logged in as: {email}
          </p>
        </div>

        {/* DASHBOARD CARDS */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* ADMISSIONS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              🎓
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Admissions
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Manage student admission applications.
            </p>

            <button
              type="button"
              onClick={() => router.push("/admin/admissions")}
              className="mt-5 text-sm font-bold text-green-700 transition hover:text-green-900"
            >
              View Admissions →
            </button>
          </div>

          {/* ENQUIRIES */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              📩
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Enquiries
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              View and manage website enquiries.
            </p>

            <button
              type="button"
              onClick={() => router.push("/admin/enquiries")}
              className="mt-5 text-sm font-bold text-green-700 transition hover:text-green-900"
            >
              View Enquiries →
            </button>
          </div>

          {/* STUDENTS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
              👨‍🎓
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Students
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Manage registered students and records.
            </p>

            <button
              type="button"
              onClick={() => router.push("/admin/students")}
              className="mt-5 text-sm font-bold text-green-700 transition hover:text-green-900"
            >
              View Students →
            </button>
          </div>

          {/* WEBSITE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
              🌐
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Website
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Quickly access the public madrasa website.
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 text-sm font-bold text-green-700 transition hover:text-green-900"
            >
              Open Website →
            </button>
          </div>
        </div>

        {/* QUICK INFORMATION */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Quick Information
            </h3>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {/* TOTAL STUDENTS */}
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Total Students
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {studentCount}
              </p>
            </div>

            {/* ADMISSIONS */}
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Admission Applications
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {admissionCount}
              </p>
            </div>

            {/* ENQUIRIES */}
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                New Enquiries
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {enquiryCount}
              </p>
            </div>
          </div>
        </div>

        {/* RECENT STATUS */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">
            System Status
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                ✅
              </div>

              <div>
                <p className="font-bold text-green-800">
                  Admin Login
                </p>

                <p className="text-sm text-green-700">
                  Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                ✅
              </div>

              <div>
                <p className="font-bold text-green-800">
                  Supabase
                </p>

                <p className="text-sm text-green-700">
                  Connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                ✅
              </div>

              <div>
                <p className="font-bold text-green-800">
                  Website
                </p>

                <p className="text-sm text-green-700">
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
