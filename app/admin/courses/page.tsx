"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  name: "",
  description: "",
  duration: "",
  image_url: "",
  active: true,
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function verifyAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/admin");
      return false;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || isAdmin !== true) {
      await supabase.auth.signOut();
      router.replace("/admin");
      return false;
    }

    return true;
  }

  async function loadCourses() {
    setError("");
    const { data, error: loadError } = await supabase
      .from("courses")
      .select("id,name,description,duration,image_url,active,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setCourses((data || []) as Course[]);
  }

  useEffect(() => {
    let mounted = true;

    async function start() {
      const ok = await verifyAdmin();
      if (!ok || !mounted) return;
      await loadCourses();
      if (mounted) setLoading(false);
    }

    start().catch((err) => {
      if (mounted) {
        setError(err instanceof Error ? err.message : "Courses load nahi ho sake.");
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(course: Course) {
    setEditingId(course.id);
    setForm({
      name: course.name,
      description: course.description || "",
      duration: course.duration || "",
      image_url: course.image_url || "",
      active: course.active,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const name = form.name.trim();
    if (!name) {
      setError("Course name zaroori hai.");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      description: form.description.trim() || null,
      duration: form.duration.trim() || null,
      image_url: form.image_url.trim() || null,
      active: form.active,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase.from("courses").update(payload).eq("id", editingId)
      : await supabase.from("courses").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setMessage(editingId ? "Course successfully update ho gaya." : "Course successfully add ho gaya.");
    resetForm();
    await loadCourses();
    setSaving(false);
  }

  async function toggleActive(course: Course) {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("courses")
      .update({ active: !course.active, updated_at: new Date().toISOString() })
      .eq("id", course.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(course.active ? "Course website se hide kar diya gaya." : "Course website par active kar diya gaya.");
    await loadCourses();
  }

  async function deleteCourse(course: Course) {
    const confirmed = window.confirm(`“${course.name}” ko permanently delete karna hai?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase.from("courses").delete().eq("id", course.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingId === course.id) resetForm();
    setMessage("Course permanently delete ho gaya.");
    await loadCourses();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
          <p className="mt-4 font-semibold text-gray-600">Loading courses...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button onClick={() => router.push("/admin/dashboard")} className="text-sm font-bold text-green-700 hover:text-green-900">← Back to Dashboard</button>
            <h1 className="mt-3 text-3xl font-black text-gray-900">Courses Management</h1>
            <p className="mt-2 text-gray-600">Yahan se add, edit, active/inactive aur delete karne par public website automatically update hogi.</p>
          </div>
          <div className="rounded-2xl bg-green-50 px-5 py-4 text-center ring-1 ring-green-100">
            <p className="text-2xl font-black text-green-800">{courses.length}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">Total Courses</p>
          </div>
        </div>

        {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">{error}</div>}
        {message && <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-800">{message}</div>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          <form onSubmit={saveCourse} className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-gray-900">{editingId ? "Edit Course" : "Add New Course"}</h2>
              {editingId && <button type="button" onClick={resetForm} className="text-sm font-bold text-gray-500 hover:text-gray-900">Cancel</button>}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Course Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Hifz-ul-Quran" className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Course ke baare me short description..." className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Duration</label>
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 Years / Regular" className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Image URL (optional)</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-4">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-5 w-5 accent-green-700" />
                <span><span className="block font-bold text-gray-800">Show on website</span><span className="text-xs text-gray-500">Inactive course public website par nahi dikhega.</span></span>
              </label>

              <button disabled={saving} type="submit" className="w-full rounded-xl bg-green-700 px-5 py-3.5 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Saving..." : editingId ? "Update Course" : "Add Course"}
              </button>
            </div>
          </form>

          <section className="space-y-4">
            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <div className="text-5xl">📚</div>
                <h2 className="mt-4 text-xl font-black text-gray-900">Abhi koi course nahi hai</h2>
                <p className="mt-2 text-gray-500">Left side se pehla course add karein.</p>
              </div>
            ) : courses.map((course) => (
              <article key={course.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-100 text-2xl">
                      {course.image_url ? <img src={course.image_url} alt="" className="h-full w-full object-cover" /> : "📖"}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-gray-900">{course.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${course.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{course.active ? "Active" : "Inactive"}</span>
                      </div>
                      <p className="mt-2 leading-7 text-gray-600">{course.description || "No description added."}</p>
                      {course.duration && <p className="mt-3 text-sm font-bold text-green-700">Duration: {course.duration}</p>}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button onClick={() => startEdit(course)} className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">Edit</button>
                    <button onClick={() => toggleActive(course)} className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100">{course.active ? "Hide" : "Show"}</button>
                    <button onClick={() => deleteCourse(course)} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100">Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
