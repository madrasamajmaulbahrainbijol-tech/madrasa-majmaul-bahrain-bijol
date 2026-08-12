"use client";

import { useEffect, useMemo, useState } from "react";
import {
  supabase,
  uploadNoticeImage,
  deleteNoticeImage,
} from "@/lib/supabase";

type Notice = {
  id: string;
  title: string;
  description: string | null;
  notice_date: string | null;
  image_url: string | null;
  important: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type NoticeForm = {
  title: string;
  description: string;
  notice_date: string;
  image_url: string;
  important: boolean;
  published: boolean;
};

const emptyForm: NoticeForm = {
  title: "",
  description: "",
  notice_date: new Date().toISOString().split("T")[0],
  image_url: "",
  important: false,
  published: true,
};

export default function NoticesAdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [form, setForm] = useState<NoticeForm>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "published" | "draft" | "important"
  >("all");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("notice_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Notices load nahi ho sake.");
    } else {
      setNotices((data || []) as Notice[]);
    }

    setLoading(false);
  }

  function openAddForm() {
    setEditingNotice(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(notice: Notice) {
    setEditingNotice(notice);

    setForm({
      title: notice.title || "",
      description: notice.description || "",
      notice_date:
        notice.notice_date || new Date().toISOString().split("T")[0],
      image_url: notice.image_url || "",
      important: Boolean(notice.important),
      published: Boolean(notice.published),
    });

    setSelectedImage(null);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving || uploading) return;

    setShowForm(false);
    setEditingNotice(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setMessage("");
    setError("");
  }

  async function handleImageUpload() {
    if (!selectedImage) {
      return form.image_url || "";
    }

    setUploading(true);
    setError("");

    try {
      const oldImageUrl = form.image_url;

      const imageUrl = await uploadNoticeImage(selectedImage);

      if (oldImageUrl && oldImageUrl !== imageUrl) {
        try {
          await deleteNoticeImage(oldImageUrl);
        } catch (deleteError) {
          console.warn("Old image delete failed:", deleteError);
        }
      }

      setForm((prev) => ({
        ...prev,
        image_url: imageUrl,
      }));

      setSelectedImage(null);

      return imageUrl;
    } catch (err) {
      console.error(err);
      throw new Error("Image upload nahi ho saki.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Notice title zaroor likhein.");
      return;
    }

    if (!form.description.trim()) {
      setError("Notice description zaroor likhein.");
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = form.image_url;

      if (selectedImage) {
        finalImageUrl = await handleImageUpload();
      }

      const noticeData = {
        title: form.title.trim(),
        description: form.description.trim(),
        notice_date: form.notice_date || null,
        image_url: finalImageUrl || null,
        important: form.important,
        published: form.published,
        updated_at: new Date().toISOString(),
      };

      if (editingNotice) {
        const { error } = await supabase
          .from("notices")
          .update(noticeData)
          .eq("id", editingNotice.id);

        if (error) {
          throw error;
        }

        setMessage("Notice successfully update ho gaya.");
      } else {
        const { error } = await supabase.from("notices").insert({
          ...noticeData,
          created_at: new Date().toISOString(),
        });

        if (error) {
          throw error;
        }

        setMessage("New notice successfully add ho gaya.");
      }

      await loadNotices();

      setTimeout(() => {
        closeForm();
      }, 700);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Notice save nahi ho saka. Supabase table/settings check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(notice: Notice) {
    const confirmed = window.confirm(
      `Kya aap "${notice.title}" notice ko permanently delete karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const { error } = await supabase
        .from("notices")
        .delete()
        .eq("id", notice.id);

      if (error) {
        throw error;
      }

      if (notice.image_url) {
        try {
          await deleteNoticeImage(notice.image_url);
        } catch (imageError) {
          console.warn("Notice image delete failed:", imageError);
        }
      }

      setMessage("Notice delete ho gaya.");
      await loadNotices();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message || "Notice delete nahi ho saka."
      );
    }
  }

  async function togglePublished(notice: Notice) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("notices")
      .update({
        published: !notice.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notice.id);

    if (error) {
      console.error(error);
      setError("Notice status update nahi ho saka.");
      return;
    }

    await loadNotices();
  }

  async function toggleImportant(notice: Notice) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("notices")
      .update({
        important: !notice.important,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notice.id);

    if (error) {
      console.error(error);
      setError("Important status update nahi ho saka.");
      return;
    }

    await loadNotices();
  }

  const filteredNotices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return notices.filter((notice) => {
      const matchesSearch =
        !keyword ||
        notice.title.toLowerCase().includes(keyword) ||
        (notice.description || "").toLowerCase().includes(keyword);

      let matchesFilter = true;

      if (filter === "published") {
        matchesFilter = notice.published;
      }

      if (filter === "draft") {
        matchesFilter = !notice.published;
      }

      if (filter === "important") {
        matchesFilter = notice.important;
      }

      return matchesSearch && matchesFilter;
    });
  }, [notices, search, filter]);

  const publishedCount = notices.filter((n) => n.published).length;
  const draftCount = notices.filter((n) => !n.published).length;
  const importantCount = notices.filter((n) => n.important).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              Notice Board
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Website ke tamam notices yahin se manage karein.
            </p>
          </div>

          <a
            href="/admin/dashboard"
            className="hidden rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 sm:inline-flex"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* TOP MESSAGE */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            ⚠ {error}
          </div>
        )}

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Notices"
            value={notices.length}
            icon="📢"
          />

          <StatCard
            label="Published"
            value={publishedCount}
            icon="✓"
            valueClass="text-emerald-600"
          />

          <StatCard
            label="Drafts"
            value={draftCount}
            icon="📝"
            valueClass="text-amber-600"
          />

          <StatCard
            label="Important"
            value={importantCount}
            icon="⭐"
            valueClass="text-red-600"
          />
        </section>

        {/* ACTION BAR */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Search Notices
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title ya description search karein..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="lg:w-52">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Filter
              </label>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value as
                      | "all"
                      | "published"
                      | "draft"
                      | "important"
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All Notices</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="important">Important</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800"
            >
              + Add New Notice
            </button>
          </div>
        </section>

        {/* NOTICE LIST */}
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">
              All Notices
              <span className="ml-2 text-sm font-semibold text-slate-400">
                ({filteredNotices.length})
              </span>
            </h2>

            <button
              type="button"
              onClick={loadNotices}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
              <p className="font-semibold text-slate-500">
                Notices load ho rahe hain...
              </p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <div className="text-5xl">📢</div>

              <h3 className="mt-4 text-xl font-black">
                No Notices Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Abhi koi notice available nahi hai.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-6 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white"
              >
                + Create First Notice
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onEdit={() => openEditForm(notice)}
                  onDelete={() => handleDelete(notice)}
                  onTogglePublished={() => togglePublished(notice)}
                  onToggleImportant={() => toggleImportant(notice)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">
                  Notice Management
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {editingNotice ? "Edit Notice" : "Add New Notice"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving || uploading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-6 py-6"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Notice Title *
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                      })
                    }
                    placeholder="Example: Annual Examination 2026"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Notice Details *
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    placeholder="Notice ki complete details yahan likhein..."
                    rows={7}
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>

                {/* DATE */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Notice Date
                  </label>

                  <input
                    type="date"
                    value={form.notice_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notice_date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:w-auto"
                  />
                </div>

                {/* IMAGE */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Notice Image
                  </label>

                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedImage(file);
                      }}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-bold file:text-emerald-800 hover:file:bg-emerald-200"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG, WEBP etc. — image Supabase Storage ke
                      notice-images bucket mein upload hogi.
                    </p>

                    {selectedImage && (
                      <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                        ✓ New image selected: {selectedImage.name}
                      </div>
                    )}

                    {form.image_url && !selectedImage && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Current Image
                        </p>

                        <img
                          src={form.image_url}
                          alt="Current notice"
                          className="max-h-60 w-full rounded-xl border border-slate-200 object-contain bg-white"
                        />
                      </div>
                    )}

                    {selectedImage && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          New Image Preview
                        </p>

                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="New notice preview"
                          className="max-h-60 w-full rounded-xl border border-slate-200 object-contain bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* OPTIONS */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={form.important}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          important: e.target.checked,
                        })
                      }
                      className="h-5 w-5 accent-emerald-700"
                    />

                    <div>
                      <p className="font-bold text-slate-800">
                        ⭐ Important Notice
                      </p>

                      <p className="text-xs text-slate-500">
                        Notice ko important mark karein.
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          published: e.target.checked,
                        })
                      }
                      className="h-5 w-5 accent-emerald-700"
                    />

                    <div>
                      <p className="font-bold text-slate-800">
                        ✓ Publish Notice
                      </p>

                      <p className="text-xs text-slate-500">
                        ON = website par visible.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving || uploading}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-xl bg-emerald-700 px-7 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading
                    ? "Uploading Image..."
                    : saving
                    ? "Saving..."
                    : editingNotice
                    ? "✓ Update Notice"
                    : "+ Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: number;
  icon: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>

        <span className="text-xl">{icon}</span>
      </div>

      <p className={`mt-3 text-3xl font-black ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   NOTICE CARD
========================================================= */

function NoticeCard({
  notice,
  onEdit,
  onDelete,
  onTogglePublished,
  onToggleImportant,
}: {
  notice: Notice;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublished: () => void;
  onToggleImportant: () => void;
}) {
  const formattedDate = notice.notice_date
    ? new Date(`${notice.notice_date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "No date";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col md:flex-row">
        {/* IMAGE */}
        {notice.image_url ? (
          <div className="h-56 w-full shrink-0 bg-slate-100 md:h-auto md:w-64">
            <img
              src={notice.image_url}
              alt={notice.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-40 w-full shrink-0 items-center justify-center bg-gradient-to-br from-emerald-700 to-emerald-900 text-5xl md:h-auto md:w-64">
            📢
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {notice.important && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                ⭐ Important
              </span>
            )}

            {notice.published ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                ✓ Published
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                📝 Draft
              </span>
            )}

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              📅 {formattedDate}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-black text-slate-900">
            {notice.title}
          </h3>

          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
            {notice.description || "No description available."}
          </p>

          {/* ACTIONS */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              ✏️ Edit
            </button>

            <button
              type="button"
              onClick={onTogglePublished}
              className={`rounded-lg px-4 py-2 text-xs font-bold text-white transition ${
                notice.published
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {notice.published
                ? "⏸ Unpublish"
                : "✓ Publish"}
            </button>

            <button
              type="button"
              onClick={onToggleImportant}
              className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              {notice.important
                ? "☆ Remove Important"
                : "⭐ Important"}
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
