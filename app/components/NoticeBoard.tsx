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

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const latestImportantNotice =
    notices.find((notice) => notice.important) || notices[0] || null;

  return (
    <section id="notices" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

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
            Stay updated with the latest admissions, meetings, examinations,
            programmes and important announcements.
          </p>
        </div>

        {/* =====================================================
            NOTICE CONTENT
        ====================================================== */}

        <div className="mt-16 grid gap-8 lg:grid-cols-2">

          {/* ===================================================
              LATEST NOTICES
          ==================================================== */}

          <div className="overflow-hidden rounded-[30px] bg-green-700 p-6 text-white md:p-8">

            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-extrabold md:text-3xl">
                Latest Notices
              </h3>

              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                2026-27
              </span>
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="mt-8 rounded-2xl bg-white/10 p-6 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                <p className="mt-3 text-sm text-green-100">
                  Loading notices...
                </p>
              </div>
            ) : notices.length === 0 ? (

              /* EMPTY */

              <div className="mt-8 rounded-2xl bg-white/10 p-6 text-center">
                <div className="text-4xl">
                  📢
                </div>

                <p className="mt-3 font-semibold text-white">
                  No notices available.
                </p>

                <p className="mt-1 text-sm text-green-100">
                  Please check again later.
                </p>
              </div>

            ) : (

              /* NOTICE LIST */

              <div className="mt-8 space-y-4">

                {notices.map((notice, index) => (
                  <div
                    key={notice.id}
                    className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm transition duration-300 hover:bg-white/15"
                  >

                    {/* =================================================
                        NOTICE IMAGE
                    ================================================== */}

                    {notice.image_url && (
                      <div className="w-full overflow-hidden">
                        <img
                          src={notice.image_url}
                          alt={notice.title}
                          className="h-48 w-full object-cover transition duration-500 hover:scale-105 md:h-56"
                        />
                      </div>
                    )}

                    {/* =================================================
                        NOTICE CONTENT
                    ================================================== */}

                    <div className="p-5">
                      <div className="flex items-start gap-4">

                        {/* NUMBER */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-green-700">
                          {index + 1}
                        </div>

                        <div className="min-w-0">

                          {/* IMPORTANT BADGE */}

                          <div className="flex flex-wrap items-center gap-2">
                            {notice.important && (
                              <span className="rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-bold text-white">
                                ⭐ Important
                              </span>
                            )}
                          </div>

                          {/* TITLE */}

                          <h4 className="mt-1 text-base font-bold leading-7 md:text-lg">
                            {notice.title}
                          </h4>

                          {/* DATE */}

                          <p className="mt-1 text-sm font-medium text-green-200">
                            {formatDate(notice.notice_date)}
                          </p>

                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

          {/* ===================================================
              IMPORTANT ANNOUNCEMENT
          ==================================================== */}

          <div className="rounded-[30px] border border-gray-200 bg-gray-50 p-6 md:p-8">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              📢
            </div>

            <h3 className="mt-6 text-2xl font-extrabold text-gray-900 md:text-3xl">
              Important Announcement
            </h3>

            <div className="mt-4 h-1 w-14 rounded-full bg-green-600" />

            {latestImportantNotice ? (
              <>

                {/* =================================================
                    IMPORTANT NOTICE IMAGE
                ================================================== */}

                {latestImportantNotice.image_url && (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <img
                      src={latestImportantNotice.image_url}
                      alt={latestImportantNotice.title}
                      className="h-56 w-full object-cover transition duration-500 hover:scale-105 md:h-64"
                    />
                  </div>
                )}

                {/* TITLE */}

                <h4 className="mt-6 text-xl font-bold text-gray-900">
                  {latestImportantNotice.title}
                </h4>

                {/* DESCRIPTION */}

                <p className="mt-4 whitespace-pre-line text-base leading-8 text-gray-600 md:text-lg">
                  {latestImportantNotice.description ||
                    "Please check this section regularly for the latest updates from the madrasa administration."}
                </p>

                {/* DATE */}

                <div className="mt-8 rounded-2xl border border-green-100 bg-white p-5">
                  <p className="font-semibold leading-7 text-gray-800">
                    📅{" "}
                    {formatDate(latestImportantNotice.notice_date)}
                  </p>
                </div>

              </>
            ) : (
              <>
                <p className="mt-6 text-base leading-8 text-gray-600 md:text-lg">
                  Welcome to the official website of Madrasa Majmaul Bahrain
                  Bijol. All admission updates, examination schedules,
                  holidays, events and important announcements will be
                  published here.
                </p>

                <div className="mt-8 rounded-2xl border border-green-100 bg-white p-5">
                  <p className="font-semibold leading-7 text-gray-800">
                    Please check this section regularly for the latest updates
                    from the madrasa administration.
                  </p>
                </div>
              </>
            )}

            {/* VIEW ALL */}

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("notices")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="mt-8 rounded-xl bg-green-600 px-7 py-3.5 font-bold text-white transition duration-300 hover:bg-green-700"
            >
              View All Notices
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}
