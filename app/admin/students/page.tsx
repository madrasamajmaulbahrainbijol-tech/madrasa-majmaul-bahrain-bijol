"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

type Student = {
  id: string;
  student_name: string | null;
  guardian_name: string | null;
  mobile: string | null;
  email: string | null;
  course: string | null;
  status: string | null;
  created_at: string | null;
  updated_at?: string | null;
  [key: string]: any;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const loadStudents = async () => {
    setError("");

    try {
      const { data, error } = await supabase
        .from("admissions")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Students load error:", error);
        setError(error.message);
        setStudents([]);
        return;
      }

      setStudents((data || []) as Student[]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to load students.");
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
  };

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const studentName = String(
        student.student_name || ""
      ).toLowerCase();

      const guardianName = String(
        student.guardian_name || ""
      ).toLowerCase();

      const mobile = String(student.mobile || "").toLowerCase();

      const email = String(student.email || "").toLowerCase();

      const course = String(student.course || "").toLowerCase();

      return (
        studentName.includes(query) ||
        guardianName.includes(query) ||
        mobile.includes(query) ||
        email.includes(query) ||
        course.includes(query)
      );
    });
  }, [students, search]);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const formatDateTime = (date: string | null | undefined) => {
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
      return "—";
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "ST";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${
      words[words.length - 1][0]
    }`.toUpperCase();
  };

  const getStudentNumber = (
    student: Student,
    index: number
  ) => {
    const position = students.findIndex(
      (item) => item.id === student.id
    );

    if (position >= 0) {
      return position + 1;
    }

    return index + 1;
  };

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-green-700">
              MADRASA MAJMAUL BAHRAIN BIJOL
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Students whose admission has been approved.
            </p>
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
      <section className="mx-auto max-w-[1400px] px-5 py-8 md:px-8">
        {/* HERO */}
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-green-950 via-green-800 to-green-600 p-7 text-white shadow-xl md:p-10">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-green-200">
                APPROVED STUDENTS
              </p>

              <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
                All Students
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 md:text-base">
                This section automatically shows students whose
                admission applications have been approved by the
                madrasa administration.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl bg-white px-6 py-3 font-bold text-green-700 shadow-lg transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Students
            </p>

            <p className="mt-2 text-4xl font-extrabold text-green-700">
              {loading ? "..." : students.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Approved admissions
            </p>
          </div>

          {/* SHOWING */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Showing
            </p>

            <p className="mt-2 text-4xl font-extrabold text-blue-600">
              {loading ? "..." : filteredStudents.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Matching students
            </p>
          </div>

          {/* STATUS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Admission Status
            </p>

            <p className="mt-2 text-2xl font-extrabold text-green-700">
              Approved
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Only approved students
            </p>
          </div>

          {/* DATABASE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Data Source
            </p>

            <p className="mt-2 text-2xl font-extrabold text-slate-800">
              Supabase
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Live database
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label
                htmlFor="student-search"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Search Students
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                  🔎
                </span>

                <input
                  id="student-search"
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search student, guardian, mobile, email or course..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-gray-50"
            >
              Clear Search
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">
              Unable to load students
            </p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />

            <p className="mt-4 font-semibold text-slate-700">
              Loading approved students...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredStudents.length === 0 && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">
                🎓
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-slate-900">
                {search
                  ? "No students found"
                  : "No approved students yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {search
                  ? "No approved student matches your search. Try another name, mobile number, email or course."
                  : "Students will automatically appear here after their admission application is approved from the Admissions section."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

        {/* STUDENT LIST */}
        {!loading && filteredStudents.length > 0 && (
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Student Records
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Showing {filteredStudents.length} of{" "}
                  {students.length} approved students.
                </p>
              </div>
            </div>

            {filteredStudents.map((student, index) => (
              <article
                key={student.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="p-6 md:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* STUDENT INFO */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl font-extrabold text-green-800">
                        {getInitials(
                          student.student_name
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-green-800">
                            Student #
                            {getStudentNumber(
                              student,
                              index
                            )}
                          </span>

                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            ✓ Approved
                          </span>
                        </div>

                        <h3 className="mt-3 break-words text-2xl font-extrabold text-slate-900">
                          {student.student_name ||
                            "Student Name Not Available"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Student ID:{" "}
                          <span className="font-semibold text-slate-700">
                            {student.id}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedStudent(student)
                        }
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        👁 View Full Details
                      </button>

                      {student.mobile && (
                        <a
                          href={`tel:${student.mobile}`}
                          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          📞 Call
                        </a>
                      )}

                      {student.mobile && (
                        <a
                          href={`https://wa.me/${String(
                            student.mobile
                          ).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="mt-7 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Guardian
                      </p>

                      <p className="mt-2 break-words font-bold text-slate-800">
                        {student.guardian_name ||
                          "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Mobile
                      </p>

                      <p className="mt-2 break-words font-bold text-slate-800">
                        {student.mobile || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Course
                      </p>

                      <p className="mt-2 break-words font-bold text-slate-800">
                        {student.course || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Admission Date
                      </p>

                      <p className="mt-2 font-bold text-slate-800">
                        {formatDate(
                          student.created_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* DETAILS MODAL */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedStudent(null)
          }
        >
          <div
            className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gradient-to-r from-green-950 to-green-700 px-6 py-6 text-white md:px-8">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-green-200">
                  STUDENT PROFILE
                </p>

                <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
                  {selectedStudent.student_name ||
                    "Student"}
                </h2>

                <p className="mt-1 text-sm text-green-100">
                  Approved admission record
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-light text-white transition hover:bg-white/25"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="max-h-[calc(92vh-110px)] overflow-y-auto p-6 md:p-8">
              {/* PROFILE TOP */}
              <div className="flex flex-col gap-5 rounded-2xl border border-green-100 bg-green-50 p-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-2xl font-extrabold text-white">
                  {getInitials(
                    selectedStudent.student_name
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-2xl font-extrabold text-slate-900">
                    {selectedStudent.student_name ||
                      "—"}
                  </h3>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    ID: {selectedStudent.id}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-green-700 px-3 py-1 text-xs font-extrabold text-white">
                    ✓ APPROVED
                  </span>
                </div>
              </div>

              {/* BASIC INFORMATION */}
              <section className="mt-7">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Basic Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailBox
                    label="Student Full Name"
                    value={
                      selectedStudent.student_name
                    }
                  />

                  <DetailBox
                    label="Father / Guardian Name"
                    value={
                      selectedStudent.guardian_name
                    }
                  />

                  <DetailBox
                    label="Mobile Number"
                    value={selectedStudent.mobile}
                  />

                  <DetailBox
                    label="Email Address"
                    value={selectedStudent.email}
                  />

                  <DetailBox
                    label="Course / Program"
                    value={selectedStudent.course}
                  />

                  <DetailBox
                    label="Admission Status"
                    value="Approved"
                    green
                  />

                  <DetailBox
                    label="Admission Submitted"
                    value={formatDateTime(
                      selectedStudent.created_at
                    )}
                  />

                  <DetailBox
                    label="Last Updated"
                    value={formatDateTime(
                      selectedStudent.updated_at
                    )}
                  />
                </div>
              </section>

              {/* QUICK ACTIONS */}
              <section className="mt-7">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Quick Actions
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {selectedStudent.mobile && (
                    <a
                      href={`tel:${selectedStudent.mobile}`}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      📞 Call Student
                    </a>
                  )}

                  {selectedStudent.mobile && (
                    <a
                      href={`https://wa.me/${String(
                        selectedStudent.mobile
                      ).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-green-700"
                    >
                      💬 WhatsApp
                    </a>
                  )}

                  {selectedStudent.email && (
                    <a
                      href={`mailto:${selectedStudent.email}`}
                      className="rounded-xl bg-purple-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-purple-700"
                    >
                      ✉ Email
                    </a>
                  )}
                </div>
              </section>

              {/* FUTURE PROFILE AREA */}
              <section className="mt-7 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                <h3 className="font-extrabold text-slate-800">
                  Student Records
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Attendance, class details, fees,
                  documents, address and other student
                  records can be added here in the next
                  stage.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* DETAIL BOX */
function DetailBox({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string | null | undefined;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 break-words font-bold ${
          green
            ? "text-green-700"
            : "text-slate-800"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
