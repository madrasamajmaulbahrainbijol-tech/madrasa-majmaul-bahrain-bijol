"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  supabase,
  uploadNoticeImage,
  deleteNoticeImage,
} from "../../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

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

type FilterType =
  | "all"
  | "published"
  | "draft"
  | "important";

/* =========================================================
   DEFAULT FORM
========================================================= */

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const getEmptyForm = (): NoticeForm => ({
  title: "",
  description: "",
  notice_date: getToday(),
  image_url: "",
  important: false,
  published: true,
});

/* =========================================================
   MAIN PAGE
========================================================= */

export default function NoticesAdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] =
    useState<Notice | null>(null);

  const [form, setForm] = useState<NoticeForm>(
    getEmptyForm()
  );

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string>("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     LOAD NOTICES ON PAGE LOAD
  ======================================================= */

  useEffect(() => {
    loadNotices();
  }, []);

  /* =======================================================
     IMAGE PREVIEW CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =======================================================
     LOAD NOTICES
  ======================================================= */

  async function loadNotices() {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("notice_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setNotices((data || []) as Notice[]);
    } catch (err: any) {
      console.error(
        "Load notices error:",
        err
      );

      setError(
        err?.message ||
          "Notices load nahi ho sake."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     OPEN ADD FORM
  ======================================================= */

  function openAddForm() {
    clearPreview();

    setEditingNotice(null);
    setForm(getEmptyForm());
    setSelectedImage(null);

    setMessage("");
    setError("");

    setShowForm(true);
  }

  /* =======================================================
     OPEN EDIT FORM
  ======================================================= */

  function openEditForm(notice: Notice) {
    clearPreview();

    setEditingNotice(notice);

    setForm({
      title: notice.title || "",
      description:
        notice.description || "",
      notice_date:
        notice.notice_date || getToday(),
      image_url:
        notice.image_url || "",
      important:
        Boolean(notice.important),
      published:
        Boolean(notice.published),
    });

    setSelectedImage(null);

    setMessage("");
    setError("");

    setShowForm(true);
  }

  /* =======================================================
     CLEAR IMAGE PREVIEW
  ======================================================= */

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
  }

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  function closeForm() {
    if (saving || uploading) {
      return;
    }

    clearPreview();

    setShowForm(false);
    setEditingNotice(null);
    setForm(getEmptyForm());
    setSelectedImage(null);

    setMessage("");
    setError("");
  }

  /* =======================================================
     IMAGE SELECT
  ======================================================= */

  function handleImageSelect(
    file: File | null
  ) {
    clearPreview();

    setSelectedImage(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  /* =======================================================
     UPLOAD IMAGE
  ======================================================= */

  async function handleImageUpload(): Promise<string> {
    if (!selectedImage) {
      return form.image_url || "";
    }

    setUploading(true);
    setError("");

    try {
      const oldImageUrl =
        form.image_url;

      const imageUrl =
        await uploadNoticeImage(
          selectedImage
        );

      if (
        oldImageUrl &&
        oldImageUrl !== imageUrl
      ) {
        try {
          await deleteNoticeImage(
            oldImageUrl
          );
        } catch (deleteError) {
          console.warn(
            "Old image delete failed:",
            deleteError
          );
        }
      }

      setForm((previous) => ({
        ...previous,
        image_url: imageUrl,
      }));

      setSelectedImage(null);

      clearPreview();

      return imageUrl;
    } catch (err: any) {
      console.error(
        "Image upload error:",
        err
      );

      throw new Error(
        err?.message ||
          "Image upload nahi ho saki."
      );
    } finally {
      setUploading(false);
    }
  }

  /* =======================================================
     SAVE NOTICE
  ======================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const title =
      form.title.trim();

    const description =
      form.description.trim();

    if (!title) {
      setError(
        "Notice title zaroor likhein."
      );
      return;
    }

    if (!description) {
      setError(
        "Notice description zaroor likhein."
      );
      return;
    }

    if (title.length > 200) {
      setError(
        "Notice title maximum 200 characters ka hona chahiye."
      );
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl =
        form.image_url;

      /* Upload new image if selected */

      if (selectedImage) {
        finalImageUrl =
          await handleImageUpload();
      }

      const now =
        new Date().toISOString();

      const noticeData = {
        title,
        description,
        notice_date:
          form.notice_date || null,
        image_url:
          finalImageUrl || null,
        important:
          Boolean(form.important),
        published:
          Boolean(form.published),
        updated_at: now,
      };

      /* UPDATE */

      if (editingNotice) {
        const {
          error: updateError,
        } = await supabase
          .from("notices")
          .update(noticeData)
          .eq(
            "id",
            editingNotice.id
          );

        if (updateError) {
          throw updateError;
        }

        setMessage(
          "Notice successfully update ho gaya."
        );
      }

      /* INSERT */

      else {
        const {
          error: insertError,
        } = await supabase
          .from("notices")
          .insert({
            ...noticeData,
            created_at: now,
          });

        if (insertError) {
          throw insertError;
        }

        setMessage(
          "New notice successfully add ho gaya."
        );
      }

      await loadNotices();

      setTimeout(() => {
        setShowForm(false);
        setEditingNotice(null);
        setForm(getEmptyForm());
        setSelectedImage(null);
        clearPreview();
        setMessage("");
      }, 900);
    } catch (err: any) {
      console.error(
        "Save notice error:",
        err
      );

      setError(
        err?.message ||
          "Notice save nahi ho saka. Supabase table/settings check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE NOTICE
  ======================================================= */

  async function handleDelete(
    notice: Notice
  ) {
    const confirmed =
      window.confirm(
        `Kya aap "${notice.title}" notice ko permanently delete karna chahte hain?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("notices")
        .delete()
        .eq("id", notice.id);

      if (deleteError) {
        throw deleteError;
      }

      if (notice.image_url) {
        try {
          await deleteNoticeImage(
            notice.image_url
          );
        } catch (imageError) {
          console.warn(
            "Notice image delete failed:",
            imageError
          );
        }
      }

      setMessage(
        "Notice delete ho gaya."
      );

      await loadNotices();
    } catch (err: any) {
      console.error(
        "Delete notice error:",
        err
      );

      setError(
        err?.message ||
          "Notice delete nahi ho saka."
      );
    }
  }

  /* =======================================================
     PUBLISH / UNPUBLISH
  ======================================================= */

  async function togglePublished(
    notice: Notice
  ) {
    setError("");
    setMessage("");

    try {
      const {
        error: updateError,
      } = await supabase
        .from("notices")
        .update({
          published:
            !notice.published,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", notice.id);

      if (updateError) {
        throw updateError;
      }

      setMessage(
        notice.published
          ? "Notice unpublish ho gaya."
          : "Notice publish ho gaya."
      );

      await loadNotices();
    } catch (err: any) {
      console.error(
        "Publish status error:",
        err
      );

      setError(
        err?.message ||
          "Notice status update nahi ho saka."
      );
    }
  }

  /* =======================================================
     IMPORTANT TOGGLE
  ======================================================= */

  async function toggleImportant(
    notice: Notice
  ) {
    setError("");
    setMessage("");

    try {
      const {
        error: updateError,
      } = await supabase
        .from("notices")
        .update({
          important:
            !notice.important,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", notice.id);

      if (updateError) {
        throw updateError;
      }

      setMessage(
        notice.important
          ? "Important status remove ho gaya."
          : "Notice important mark ho gaya."
      );

      await loadNotices();
    } catch (err: any) {
      console.error(
        "Important status error:",
        err
      );

      setError(
        err?.message ||
          "Important status update nahi ho saka."
      );
    }
  }

  /* =======================================================
     FILTER + SEARCH
  ======================================================= */

  const filteredNotices =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      return notices.filter(
        (notice) => {
          const title =
            notice.title?.toLowerCase() ||
            "";

          const description =
            notice.description
              ?.toLowerCase() || "";

          const matchesSearch =
            !keyword ||
            title.includes(keyword) ||
            description.includes(
              keyword
            );

          let matchesFilter = true;

          if (
            filter === "published"
          ) {
            matchesFilter =
              notice.published;
          }

          if (
            filter === "draft"
          ) {
            matchesFilter =
              !notice.published;
          }

          if (
            filter === "important"
          ) {
            matchesFilter =
              notice.important;
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      notices,
      search,
      filter,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const publishedCount =
    notices.filter(
      (notice) =>
        notice.published
    ).length;

  const draftCount =
    notices.filter(
      (notice) =>
        !notice.published
    ).length;

  const importantCount =
    notices.filter(
      (notice) =>
        notice.important
    ).length;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700 sm:text-sm">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">
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

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
            ✓ {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && !showForm && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            ⚠ {error}
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

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

        {/* =================================================
            SEARCH + FILTER + ADD
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
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
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Title ya description search karein..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="lg:w-56">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Filter
              </label>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target
                      .value as FilterType
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">
                  All Notices
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Drafts
                </option>

                <option value="important">
                  Important
                </option>
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

        {/* =================================================
            NOTICE LIST
        ================================================= */}

        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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

          {/* LOADING */}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

              <p className="font-semibold text-slate-500">
                Notices load ho rahe hain...
              </p>
            </div>
          ) : filteredNotices.length ===
            0 ? (
            /* EMPTY */

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <div className="text-5xl">
                📢
              </div>

              <h3 className="mt-4 text-xl font-black">
                No Notices Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Abhi koi notice available nahi hai.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-6 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                + Create First Notice
              </button>
            </div>
          ) : (
            /* LIST */

            <div className="space-y-4">
              {filteredNotices.map(
                (notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    onEdit={() =>
                      openEditForm(
                        notice
                      )
                    }
                    onDelete={() =>
                      handleDelete(
                        notice
                      )
                    }
                    onTogglePublished={() =>
                      togglePublished(
                        notice
                      )
                    }
                    onToggleImportant={() =>
                      toggleImportant(
                        notice
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">
                  Notice Management
                </p>

                <h2 className="mt-1 text-xl font-black sm:text-2xl">
                  {editingNotice
                    ? "Edit Notice"
                    : "Add New Notice"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={
                  saving ||
                  uploading
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
            >
              {/* FORM ERROR */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  ⚠ {error}
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
                    onChange={(event) =>
                      setForm({
                        ...form,
                        title:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Example: Annual Examination 2026"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    required
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    {form.title.length}/200
                  </p>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Notice Details *
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        description:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Notice ki complete details yahan likhein..."
                    rows={8}
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                    value={
                      form.notice_date
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        notice_date:
                          event.target
                            .value,
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

                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(
                        event
                      ) => {
                        const file =
                          event.target
                            .files?.[0] ||
                          null;

                        handleImageSelect(
                          file
                        );
                      }}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-bold file:text-emerald-800 hover:file:bg-emerald-200"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      JPG, PNG, WEBP, GIF — maximum 5MB.
                    </p>

                    {/* SELECTED IMAGE */}

                    {selectedImage && (
                      <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                        ✓ New image selected:
                        <span className="ml-1 break-all">
                          {
                            selectedImage.name
                          }
                        </span>
                      </div>
                    )}

                    {/* NEW PREVIEW */}

                    {selectedImage &&
                      previewUrl && (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            New Image Preview
                          </p>

                          <img
                            src={
                              previewUrl
                            }
                            alt="New notice preview"
                            className="max-h-72 w-full rounded-xl border border-slate-200 bg-white object-contain"
                          />
                        </div>
                      )}

                    {/* CURRENT IMAGE */}

                    {form.image_url &&
                      !selectedImage && (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            Current Image
                          </p>

                          <img
                            src={
                              form.image_url
                            }
                            alt="Current notice"
                            className="max-h-72 w-full rounded-xl border border-slate-200 bg-white object-contain"
                          />
                        </div>
                      )}
                  </div>
                </div>

                {/* OPTIONS */}

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* IMPORTANT */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-200 hover:bg-red-50">
                    <input
                      type="checkbox"
                      checked={
                        form.important
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,
                          important:
                            event.target
                              .checked,
                        })
                      }
                      className="mt-1 h-5 w-5 accent-emerald-700"
                    />

                    <div>
                      <p className="font-bold text-slate-800">
                        ⭐ Important Notice
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Notice ko important mark karein.
                      </p>
                    </div>
                  </label>

                  {/* PUBLISHED */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                    <input
                      type="checkbox"
                      checked={
                        form.published
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,
                          published:
                            event.target
                              .checked,
                        })
                      }
                      className="mt-1 h-5 w-5 accent-emerald-700"
                    />

                    <div>
                      <p className="font-bold text-slate-800">
                        ✓ Publish Notice
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        ON = website par visible.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* FORM BUTTONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={
                    saving ||
                    uploading
                  }
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploading
                  }
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
        <p className="text-sm font-semibold text-slate-500">
          {label}
        </p>

        <span className="text-xl">
          {icon}
        </span>
      </div>

      <p
        className={`mt-3 text-3xl font-black ${valueClass}`}
      >
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
  const formattedDate =
    notice.notice_date
      ? new Date(
          `${notice.notice_date}T00:00:00`
        ).toLocaleDateString(
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
            {/* IMPORTANT */}

            {notice.important && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                ⭐ Important
              </span>
            )}

            {/* PUBLISHED */}

            {notice.published ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                ✓ Published
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                📝 Draft
              </span>
            )}

            {/* DATE */}

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              📅 {formattedDate}
            </span>
          </div>

          {/* TITLE */}

          <h3 className="mt-3 text-xl font-black text-slate-900">
            {notice.title}
          </h3>

          {/* DESCRIPTION */}

          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
            {notice.description ||
              "No description available."}
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
              onClick={
                onTogglePublished
              }
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
              onClick={
                onToggleImportant
              }
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
