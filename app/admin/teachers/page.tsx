"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  image_url: string | null;
  short_details: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  name: "",
  subject: "",
  short_details: "",
  display_order: "1",
  active: true,
};

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setTeachers(data || []);
    }

    setLoading(false);
  }

  function openAddModal() {
    setEditingTeacher(null);
    setForm({
      ...emptyForm,
      display_order: String(teachers.length + 1),
    });

    setImageFile(null);
    setImagePreview(null);
    setMessage("");
    setError("");
    setShowModal(true);
  }

  function openEditModal(teacher: Teacher) {
    setEditingTeacher(teacher);

    setForm({
      name: teacher.name || "",
      subject: teacher.subject || "",
      short_details: teacher.short_details || "",
      display_order: String(teacher.display_order ?? 1),
      active: teacher.active,
    });

    setImageFile(null);
    setImagePreview(teacher.image_url || null);
    setMessage("");
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingTeacher(null);
    setImageFile(null);
    setImagePreview(null);
    setForm(emptyForm);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImageChange(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function uploadTeacherImage(
    file: File,
    teacherId: string
  ): Promise<string> {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${teacherId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("teacher-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        uploadError.message || "Teacher image upload failed."
      );
    }

    const { data } = supabase.storage
      .from("teacher-images")
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error(
        "Teacher image ka public URL nahi mila."
      );
    }

    return data.publicUrl;
  }

  async function deleteOldImage(imageUrl: string | null) {
    if (!imageUrl) return;

    try {
      const marker =
        "/storage/v1/object/public/teacher-images/";

      if (!imageUrl.includes(marker)) {
        return;
      }

      const filePath = imageUrl.split(marker)[1];

      if (!filePath) return;

      await supabase.storage
        .from("teacher-images")
        .remove([decodeURIComponent(filePath)]);
    } catch (err) {
      console.error(
        "Old teacher image delete error:",
        err
      );
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const name = form.name.trim();
      const subject = form.subject.trim();
      const shortDetails = form.short_details.trim();

      if (!name) {
        throw new Error("Teacher name is required.");
      }

      if (!subject) {
        throw new Error("Subject is required.");
      }

      const displayOrder = Number(form.display_order);

      if (
        !Number.isInteger(displayOrder) ||
        displayOrder < 1
      ) {
        throw new Error(
          "Display order must be a number starting from 1."
        );
      }

      /* =========================
         EDIT TEACHER
      ========================= */

      if (editingTeacher) {
        let imageUrl = editingTeacher.image_url;

        if (imageFile) {
          imageUrl = await uploadTeacherImage(
            imageFile,
            editingTeacher.id
          );
        }

        const { error: updateError } = await supabase
          .from("teachers")
          .update({
            name,
            subject,
            short_details:
              shortDetails || null,
            display_order: displayOrder,
            active: form.active,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTeacher.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (
          imageFile &&
          editingTeacher.image_url &&
          imageUrl !== editingTeacher.image_url
        ) {
          await deleteOldImage(
            editingTeacher.image_url
          );
        }

        setMessage(
          "Teacher updated successfully."
        );
      }

      /* =========================
         ADD TEACHER
      ========================= */

      else {
        const teacherId = crypto.randomUUID();

        let imageUrl: string | null = null;

        if (imageFile) {
          imageUrl = await uploadTeacherImage(
            imageFile,
            teacherId
          );
        }

        const { error: insertError } = await supabase
          .from("teachers")
          .insert({
            id: teacherId,
            name,
            subject,
            short_details:
              shortDetails || null,
            display_order: displayOrder,
            active: form.active,
            image_url: imageUrl,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        setMessage(
          "Teacher added successfully."
        );
      }

      await loadTeachers();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(
    teacher: Teacher
  ) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("teachers")
      .update({
        active: !teacher.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teacher.id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      `${teacher.name} is now ${
        !teacher.active
          ? "Active"
          : "Inactive"
      }.`
    );

    await loadTeachers();
  }

  async function deleteTeacher(
    teacher: Teacher
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${teacher.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", teacher.id);

    if (error) {
      setError(error.message);
      return;
    }

    if (teacher.image_url) {
      await deleteOldImage(
        teacher.image_url
      );
    }

    setMessage(
      "Teacher deleted successfully."
    );

    await loadTeachers();
  }

  const filteredTeachers =
    teachers.filter((teacher) => {
      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      return (
        teacher.name
          .toLowerCase()
          .includes(query) ||
        teacher.subject
          .toLowerCase()
          .includes(query) ||
        (teacher.short_details || "")
          .toLowerCase()
          .includes(query)
      );
    });

  const activeCount =
    teachers.filter(
      (teacher) => teacher.active
    ).length;

  const inactiveCount =
    teachers.filter(
      (teacher) => !teacher.active
    ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
              Faculty Management
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-950">
              Teachers
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-600">
              Add, edit, manage and publish your madrasa teachers.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-green-700 active:scale-[0.98]"
          >
            + Add Teacher
          </button>
        </div>

        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (
          <div className="mb-5 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
            ✓ {message}
          </div>
        )}

        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && !showModal && (
          <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            ⚠ {error}
          </div>
        )}

        {/* =========================
            STATS
        ========================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Total Teachers
            </p>

            <p className="mt-2 text-3xl font-extrabold text-slate-950">
              {teachers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-green-800">
              Active
            </p>

            <p className="mt-2 text-3xl font-extrabold text-green-700">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-orange-800">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-extrabold text-orange-700">
              {inactiveCount}
            </p>
          </div>

        </div>

        {/* =========================
            SEARCH
        ========================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="🔎 Search teacher by name, subject or details..."
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 text-base font-medium text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
          />

        </div>

        {/* =========================
            TEACHERS TABLE
        ========================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-[1000px] w-full">

              <thead className="border-b border-slate-200 bg-slate-100">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Photo
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Teacher
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Subject
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Order
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-600"
                    >
                      Loading teachers...
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                    >
                      <div className="text-4xl">
                        👨‍🏫
                      </div>

                      <p className="mt-3 font-bold text-slate-800">
                        No teachers found
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Add your first teacher using the button above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(
                    (teacher) => (
                      <tr
                        key={teacher.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* PHOTO */}

                        <td className="px-5 py-4">

                          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-300 bg-slate-100">

                            {teacher.image_url ? (
                              <Image
                                src={teacher.image_url}
                                alt={teacher.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl">
                                👨‍🏫
                              </div>
                            )}

                          </div>

                        </td>

                        {/* NAME */}

                        <td className="px-5 py-4">

                          <div className="font-extrabold text-slate-950">
                            {teacher.name}
                          </div>

                          {teacher.short_details && (
                            <div className="mt-1 max-w-xs truncate text-xs font-medium text-slate-600">
                              {teacher.short_details}
                            </div>
                          )}

                        </td>

                        {/* SUBJECT */}

                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-bold text-green-800">
                            {teacher.subject}
                          </span>

                        </td>

                        {/* ORDER */}

                        <td className="px-5 py-4 text-center">

                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-slate-800">
                            {teacher.display_order}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4 text-center">

                          <button
                            onClick={() =>
                              toggleActive(
                                teacher
                              )
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                              teacher.active
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                          >
                            {teacher.active
                              ? "✓ Active"
                              : "Inactive"}
                          </button>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEditModal(
                                  teacher
                                )
                              }
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-blue-700"
                            >
                              ✏ Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteTeacher(
                                  teacher
                                )
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-red-700"
                            >
                              🗑 Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">

          <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* =========================
                MODAL HEADER
            ========================= */}

            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-extrabold uppercase tracking-[3px] text-green-600">
                    Teacher Management
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                    {editingTeacher
                      ? "Edit Teacher"
                      : "Add New Teacher"}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Fill in the teacher information below.
                  </p>

                </div>

                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-extrabold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

            </div>

            {/* =========================
                FORM
            ========================= */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >

              <div className="space-y-7 p-5 sm:p-7">

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                    ⚠ {error}
                  </div>
                )}

                {/* =========================
                    PHOTO
                ========================= */}

                <div>

                  <label className="mb-2 block text-base font-extrabold text-slate-900">
                    Teacher Photo
                  </label>

                  <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                      <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-sm">

                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Teacher preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-slate-500">
                            <span className="text-4xl">
                              👨‍🏫
                            </span>

                            <span className="mt-2 text-xs font-bold">
                              No Photo
                            </span>
                          </div>
                        )}

                      </div>

                      <div className="flex-1">

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) =>
                            handleImageChange(
                              e.target.files?.[0] ||
                                null
                            )
                          }
                          className="hidden"
                          id="teacher-image"
                        />

                        <label
                          htmlFor="teacher-image"
                          className="inline-flex cursor-pointer items-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800"
                        >
                          📷{" "}
                          {editingTeacher
                            ? "Change Photo"
                            : "Choose Photo"}
                        </label>

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                          JPG, PNG, WebP or GIF
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Maximum file size: 5 MB
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =========================
                    TEACHER NAME
                ========================= */}

                <div>

                  <label
                    htmlFor="teacher-name"
                    className="mb-2 block text-base font-extrabold text-slate-950"
                  >
                    Teacher Name{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <input
                    id="teacher-name"
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Hafiz Mohammad Inzemamul Haque Rasheedi"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 text-base font-semibold text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Enter the complete name of the teacher.
                  </p>

                </div>

                {/* =========================
                    SUBJECT
                ========================= */}

                <div>

                  <label
                    htmlFor="teacher-subject"
                    className="mb-2 block text-base font-extrabold text-slate-950"
                  >
                    Subject{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <input
                    id="teacher-subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subject: e.target.value,
                      })
                    }
                    placeholder="e.g. Darse Nizami"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 text-base font-semibold text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Example: Hifz-ul-Quran, Nazrah & Qirat, Mathematics.
                  </p>

                </div>

                {/* =========================
                    SHORT DETAILS
                ========================= */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="teacher-details"
                      className="block text-base font-extrabold text-slate-950"
                    >
                      Short Details{" "}
                      <span className="font-semibold text-slate-500">
                        (Optional)
                      </span>
                    </label>

                    <span className="text-xs font-bold text-slate-500">
                      {form.short_details.length}/500
                    </span>

                  </div>

                  <textarea
                    id="teacher-details"
                    value={form.short_details}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        short_details:
                          e.target.value,
                      })
                    }
                    placeholder="Write a short introduction about the teacher..."
                    rows={5}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 text-base font-semibold leading-7 text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    This information can be shown on the teacher card.
                  </p>

                </div>

                {/* =========================
                    ORDER + STATUS
                ========================= */}

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* ORDER */}

                  <div>

                    <label
                      htmlFor="display-order"
                      className="mb-2 block text-base font-extrabold text-slate-950"
                    >
                      Display Order
                    </label>

                    <input
                      id="display-order"
                      type="number"
                      min="1"
                      value={form.display_order}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          display_order:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 text-base font-bold text-slate-950 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                    />

                    <p className="mt-2 text-xs font-medium text-slate-500">
                      1 = first teacher
                    </p>

                  </div>

                  {/* STATUS */}

                  <div>

                    <label className="mb-2 block text-base font-extrabold text-slate-950">
                      Website Status
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          active: !form.active,
                        })
                      }
                      className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3.5 transition ${
                        form.active
                          ? "border-green-300 bg-green-50"
                          : "border-slate-300 bg-slate-100"
                      }`}
                    >

                      <span
                        className={`text-sm font-extrabold ${
                          form.active
                            ? "text-green-800"
                            : "text-slate-700"
                        }`}
                      >
                        {form.active
                          ? "✓ Active — Show on Website"
                          : "○ Inactive — Hide from Website"}
                      </span>

                      <span
                        className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition ${
                          form.active
                            ? "bg-green-600"
                            : "bg-slate-400"
                        }`}
                      >

                        <span
                          className={`block h-5 w-5 rounded-full bg-white shadow-md transition ${
                            form.active
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />

                      </span>

                    </button>

                  </div>

                </div>

              </div>

              {/* =========================
                  FOOTER
              ========================= */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t-2 border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-green-600 px-7 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingTeacher
                    ? "✓ Update Teacher"
                    : "+ Add Teacher"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}
