"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

type Notice = {
  id: string;
  title: string;
  description: string | null;
  notice_date: string | null;
  image_url: string | null;
  important: boolean;
  published: boolean;
  created_at: string;
};

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] =
    useState<Notice | null>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("notices")
        .select(
          "id, title, description, notice_date, image_url, important, published, created_at"
        )
        .eq("published", true)
        .order("important", {
          ascending: false,
        })
        .order("notice_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      if (error) {
        console.error("NoticeBoard load error:", error);
        setNotices([]);
        return;
      }

      setNotices((data || []) as Notice[]);
    } catch (error) {
      console.error("NoticeBoard error:", error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "No date";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const latestImportantNotice =
    notices.find((notice) => notice.important) ||
    notices[0] ||
    null;

  return (
    <>
      <section
        id="notices"
        className="overflow-hidden bg-white py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">

          {/* =====================================================
              HEADING
          ====================================================== */}

          <div className="text-center">
            <p className="font-bold uppercase tracking-[4px] text-green-600">
              Latest Updates
            </p>

            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
              Notice Board
            </h2>

            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600" />

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              Stay updated with the latest admissions,
              meetings, examinations, programmes and
              important announcements.
            </p>
          </div>

          {/* =====================================================
              MAIN NOTICE AREA
          ====================================================== */}

          <div className="mt-16 grid w-full min-w-0 gap-8 lg:grid-cols-2">

            {/* ===================================================
                LEFT — LATEST NOTICES
            ==================================================== */}

            <div className="min-w-0 overflow-hidden rounded-[30px] bg-green-700 p-5 text-white sm:p-6 md:p-8">

              <div className="flex min-w-0 items-center justify-between gap-4">
                <h3 className="min-w-0 text-2xl font-extrabold md:text-3xl">
                  Latest Notices
                </h3>

                <span className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold sm:text-sm">
                  2026-27
                </span>
              </div>

              {/* =================================================
                  LOADING
              ================================================== */}

              {loading ? (
                <div className="mt-8 rounded-2xl bg-white/10 p-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                  <p className="mt-3 text-sm text-green-100">
                    Loading notices...
                  </p>
                </div>
              ) : notices.length === 0 ? (

                /* =================================================
                   EMPTY
                ================================================== */

                <div className="mt-8 rounded-2xl bg-white/10 p-8 text-center">
                  <div className="text-4xl">
                    📢
                  </div>

                  <p className="mt-3 font-semibold">
                    No notices available.
                  </p>

                  <p className="mt-1 text-sm text-green-100">
                    Please check again later.
                  </p>
                </div>

              ) : (

                /* =================================================
                   NOTICE LIST
                ================================================== */

                <div className="mt-8 space-y-4">

                  {notices.map((notice, index) => (
                    <button
                      key={notice.id}
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="group block w-full min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
                    >

                      {/* =================================================
                          IMAGE
                      ================================================== */}

                      {notice.image_url && (
                        <div className="w-full overflow-hidden bg-black/10">
                          <img
                            src={notice.image_url}
                            alt={notice.title}
                            className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:h-48 md:h-52"
                          />
                        </div>
                      )}

                      {/* =================================================
                          CONTENT
                      ================================================== */}

                      <div className="min-w-0 p-4 sm:p-5">

                        <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                          {/* NUMBER */}

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-green-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">

                            {/* IMPORTANT */}

                            {notice.important && (
                              <span className="inline-flex max-w-full rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold text-white">
                                ⭐ Important
                              </span>
                            )}

                            {/* TITLE */}

                            <h4 className="mt-2 break-words text-base font-bold leading-7 sm:text-lg">
                              {notice.title}
                            </h4>

                            {/* DATE */}

                            <p className="mt-1 text-sm font-medium text-green-200">
                              {formatDate(notice.notice_date)}
                            </p>

                            {/* CLICK HINT */}

                            <p className="mt-3 text-xs font-semibold text-green-100 opacity-80">
                              Click to read full notice →
                            </p>

                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                </div>
              )}
            </div>

            {/* ===================================================
                RIGHT — SELECTED / IMPORTANT NOTICE
            ==================================================== */}

            <div className="min-w-0 overflow-hidden rounded-[30px] border border-gray-200 bg-gray-50 p-5 sm:p-6 md:p-8">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                📢
              </div>

              <h3 className="mt-6 break-words text-2xl font-extrabold text-gray-900 md:text-3xl">
                Important Announcement
              </h3>

              <div className="mt-4 h-1 w-14 rounded-full bg-green-600" />

              {latestImportantNotice ? (
                <>

                  {/* =================================================
                      IMAGE
                  ================================================== */}

                  {latestImportantNotice.image_url && (
                    <div className="mt-6 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      <img
                        src={latestImportantNotice.image_url}
                        alt={latestImportantNotice.title}
                        className="h-56 w-full object-cover sm:h-64"
                      />
                    </div>
                  )}

                  {/* TITLE */}

                  <h4 className="mt-6 break-words text-xl font-bold text-gray-900 md:text-2xl">
                    {latestImportantNotice.title}
                  </h4>

                  {/* DESCRIPTION */}

                  <div className="mt-4 max-h-72 overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-100 bg-white p-5">
                    <p className="break-words whitespace-pre-wrap text-base leading-8 text-gray-600 md:text-lg">
                      {latestImportantNotice.description ||
                        "Please check this section regularly for the latest updates from the madrasa administration."}
                    </p>
                  </div>

                  {/* DATE */}

                  <div className="mt-6 rounded-2xl border border-green-100 bg-white p-5">
                    <p className="break-words font-semibold leading-7 text-gray-800">
                      📅{" "}
                      {formatDate(
                        latestImportantNotice.notice_date
                      )}
                    </p>
                  </div>

                  {/* FULL NOTICE BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNotice(
                        latestImportantNotice
                      )
                    }
                    className="mt-6 w-full rounded-xl bg-green-600 px-6 py-3.5 font-bold text-white transition duration-300 hover:bg-green-700"
                  >
                    Read Full Notice
                  </button>

                </>
              ) : (
                <>
                  <p className="mt-6 break-words text-base leading-8 text-gray-600 md:text-lg">
                    Welcome to the official website of
                    Madrasa Majmaul Bahrain Bijol.
                    All admission updates, examination
                    schedules, holidays, events and
                    important announcements will be
                    published here.
                  </p>

                  <div className="mt-8 rounded-2xl border border-green-100 bg-white p-5">
                    <p className="break-words font-semibold leading-7 text-gray-800">
                      Please check this section regularly
                      for the latest updates from the
                      madrasa administration.
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FULL NOTICE MODAL
      ========================================================= */}

      {selectedNotice && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setSelectedNotice(null)}
        >

          <div
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

              <div className="min-w-0 pr-4">
                <p className="text-xs font-bold uppercase tracking-[3px] text-green-600">
                  Notice Details
                </p>

                <h3 className="mt-1 break-words text-lg font-extrabold text-gray-900 sm:text-xl">
                  {selectedNotice.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 transition hover:bg-gray-200"
                aria-label="Close notice"
              >
                ×
              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================== */}

            <div className="min-h-0 overflow-y-auto overflow-x-hidden">

              {/* IMAGE */}

              {selectedNotice.image_url && (
                <div className="w-full bg-gray-100">
                  <img
                    src={selectedNotice.image_url}
                    alt={selectedNotice.title}
                    className="max-h-[420px] w-full object-contain"
                  />
                </div>
              )}

              <div className="p-5 sm:p-7 md:p-8">

                {/* BADGES */}

                <div className="flex flex-wrap items-center gap-2">

                  {selectedNotice.important && (
                    <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                      ⭐ Important
                    </span>
                  )}

                  <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                    ✓ Published
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    📅{" "}
                    {formatDate(
                      selectedNotice.notice_date
                    )}
                  </span>

                </div>

                {/* TITLE */}

                <h2 className="mt-5 break-words text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
                  {selectedNotice.title}
                </h2>

                <div className="mt-4 h-1 w-16 rounded-full bg-green-600" />

                {/* FULL DESCRIPTION */}

                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">

                  <p className="break-words whitespace-pre-wrap text-base leading-8 text-gray-700 sm:text-lg">
                    {selectedNotice.description ||
                      "No additional details available for this notice."}
                  </p>

                </div>

              </div>
            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================== */}

            <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white px-5 py-4 sm:px-6">

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
