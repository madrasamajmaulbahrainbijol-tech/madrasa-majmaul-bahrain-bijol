"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  image_url: string | null;
  short_details: string | null;
  display_order: number;
  active: boolean;
};

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTeachers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error loading teachers:", error);
      alert(error.message);
    } else {
      setTeachers(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  async function deleteTeacher(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadTeachers();
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("teachers")
      .update({ active: !currentStatus })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadTeachers();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[3px] text-green-600">
              Faculty Management
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">
              Teachers
            </h1>

            <p className="mt-2 text-gray-600">
              Add, edit, manage and control teachers displayed on the website.
            </p>
          </div>

          <a
            href="/admin/teachers/new"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            + Add Teacher
          </a>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Teachers
            </p>

            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              {teachers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active Teachers
            </p>

            <p className="mt-2 text-3xl font-extrabold text-green-600">
              {teachers.filter((teacher) => teacher.active).length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Inactive Teachers
            </p>

            <p className="mt-2 text-3xl font-extrabold text-red-500">
              {teachers.filter((teacher) => !teacher.active).length}
            </p>
          </div>
        </div>

        {/* Teacher List */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              All Teachers
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading teachers...
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl">👨‍🏫</div>

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                No teachers added yet
              </h3>

              <p className="mt-2 text-gray-500">
                Add your first teacher to display them on the website.
              </p>

              <a
                href="/admin/teachers/new"
                className="mt-6 inline-flex rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
              >
                + Add First Teacher
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Teacher Info */}
                  <div className="flex min-w-0 items-center gap-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                      {teacher.image_url ? (
                        <img
                          src={teacher.image_url}
                          alt={teacher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">
                          👨‍🏫
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {teacher.name}
                        </h3>

                        {teacher.active ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="mt-1 font-semibold text-green-700">
                        {teacher.subject}
                      </p>

                      {teacher.short_details && (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-gray-500">
                          {teacher.short_details}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-400">
                        Display Order: {teacher.display_order}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/admin/teachers/${teacher.id}/edit`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      ✏️ Edit
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        toggleActive(teacher.id, teacher.active)
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-bold text-white ${
                        teacher.active
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {teacher.active ? "⏸ Deactivate" : "✓ Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTeacher(teacher.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
