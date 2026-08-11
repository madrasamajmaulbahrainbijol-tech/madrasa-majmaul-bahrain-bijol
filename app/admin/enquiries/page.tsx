"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

type Enquiry = {
  id: string;
  name: string;
  mobile: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  replied_at: string | null;
  rejection_reason: string | null;
  updated_at: string | null;
};

type StatusFilter = "all" | "new" | "replied" | "rejected";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadEnquiries(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data, error: fetchError } = await supabase
        .from("enquiries")
        .select(
          "id,name,mobile,email,subject,message,status,created_at,replied_at,rejection_reason,updated_at"
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setEnquiries((data || []) as Enquiry[]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to load enquiries.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesSearch =
        !searchText ||
        enquiry.name?.toLowerCase().includes(searchText) ||
        enquiry.mobile?.toLowerCase().includes(searchText) ||
        enquiry.email?.toLowerCase().includes(searchText) ||
        enquiry.subject?.toLowerCase().includes(searchText) ||
        enquiry.message?.toLowerCase().includes(searchText);

      const currentStatus = enquiry.status || "new";

      const matchesStatus =
        statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, statusFilter]);

  const totalCount = enquiries.length;

  const newCount = enquiries.filter(
    (item) => (item.status || "new") === "new"
  ).length;

  const repliedCount = enquiries.filter(
    (item) => item.status === "replied"
  ).length;

  const rejectedCount = enquiries.filter(
    (item) => item.status === "rejected"
  ).length;

  function formatDate(dateString: string | null) {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusLabel(status: string | null) {
    switch (status) {
      case "replied":
        return "Replied";
      case "rejected":
        return "Rejected";
      case "new":
      default:
        return "New";
    }
  }

  function getStatusClass(status: string | null) {
    switch (status) {
      case "replied":
        return "bg-green-100 text-green-700 border-green-200";

      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";

      case "new":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  }

  function getWhatsAppNumber(mobile: string | null) {
    if (!mobile) return "";

    let number = mobile.replace(/\D/g, "");

    if (number.startsWith("0")) {
      number = number.substring(1);
    }

    if (number.length === 10) {
      number = "91" + number;
    }

    return number;
  }

  function openEmailReply(enquiry: Enquiry) {
    if (!enquiry.email) {
      alert("This enquiry does not have an email address.");
      return;
    }

    const subject = `Re: ${enquiry.subject || "Your enquiry - Madrasa Majmaul Bahrain Bijol"}`;

    const body = `Assalamu Alaikum ${enquiry.name},

Thank you for contacting Madrasa Majmaul Bahrain Bijol.

Regarding your enquiry:

${enquiry.message || ""}

Our response:

[Please type your reply here]

Regards,
Madrasa Majmaul Bahrain Bijol
`;

    window.location.href =
      `mailto:${enquiry.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  function openWhatsAppReply(enquiry: Enquiry) {
    if (!enquiry.mobile) {
      alert("This enquiry does not have a mobile number.");
      return;
    }

    const number = getWhatsAppNumber(enquiry.mobile);

    if (!number) {
      alert("Invalid mobile number.");
      return;
    }

    const message = `Assalamu Alaikum ${enquiry.name},

Thank you for contacting Madrasa Majmaul Bahrain Bijol.

Regarding your enquiry:
${enquiry.message || ""}

Our response:

[Please type your reply here]

Regards,
Madrasa Majmaul Bahrain Bijol`;

    const whatsappUrl =
      `https://wa.me/${number}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  }

  function callPerson(enquiry: Enquiry) {
    if (!enquiry.mobile) {
      alert("This enquiry does not have a mobile number.");
      return;
    }

    window.location.href = `tel:${enquiry.mobile}`;
  }

  async function markAsReplied(enquiry: Enquiry) {
    try {
      setActionLoading(enquiry.id);
      setError("");

      const now = new Date().toISOString();

      const { data, error: updateError } = await supabase
        .from("enquiries")
        .update({
          status: "replied",
          replied_at: now,
          updated_at: now,
          rejection_reason: null,
        })
        .eq("id", enquiry.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setEnquiries((current) =>
        current.map((item) =>
          item.id === enquiry.id
            ? {
                ...item,
                status: "replied",
                replied_at: now,
                updated_at: now,
                rejection_reason: null,
              }
            : item
        )
      );

      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry({
          ...enquiry,
          status: "replied",
          replied_at: now,
          updated_at: now,
          rejection_reason: null,
        });
      }

      if (!data) {
        await loadEnquiries(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to mark this enquiry as replied."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectEnquiry(enquiry: Enquiry) {
    const reason = window.prompt(
      "Please enter the reason for rejecting this enquiry:"
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    try {
      setActionLoading(enquiry.id);
      setError("");

      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("enquiries")
        .update({
          status: "rejected",
          rejection_reason: reason.trim(),
          updated_at: now,
        })
        .eq("id", enquiry.id);

      if (updateError) {
        throw updateError;
      }

      setEnquiries((current) =>
        current.map((item) =>
          item.id === enquiry.id
            ? {
                ...item,
                status: "rejected",
                rejection_reason: reason.trim(),
                updated_at: now,
              }
            : item
        )
      );

      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry({
          ...enquiry,
          status: "rejected",
          rejection_reason: reason.trim(),
          updated_at: now,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to reject this enquiry."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function markAsNew(enquiry: Enquiry) {
    try {
      setActionLoading(enquiry.id);
      setError("");

      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("enquiries")
        .update({
          status: "new",
          replied_at: null,
          rejection_reason: null,
          updated_at: now,
        })
        .eq("id", enquiry.id);

      if (updateError) {
        throw updateError;
      }

      setEnquiries((current) =>
        current.map((item) =>
          item.id === enquiry.id
            ? {
                ...item,
                status: "new",
                replied_at: null,
                rejection_reason: null,
                updated_at: now,
              }
            : item
        )
      );

      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry({
          ...enquiry,
          status: "new",
          replied_at: null,
          rejection_reason: null,
          updated_at: now,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Unable to change enquiry status."
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-green-700">
              MADRASA MAJMAUL BAHRAIN BIJOL
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Website Enquiries
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-green-950 via-green-800 to-green-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-green-200">
                COMMUNICATION CENTER
              </p>

              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                All Website Enquiries
              </h2>

              <p className="mt-3 max-w-2xl text-sm text-green-50 sm:text-base">
                Read enquiries, contact visitors directly and manage
                their enquiry status from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadEnquiries(true)}
              disabled={refreshing}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-green-800 shadow-md transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Enquiries"
            value={totalCount}
            valueClass="text-slate-900"
          />

          <StatCard
            label="New"
            value={newCount}
            valueClass="text-blue-600"
          />

          <StatCard
            label="Replied"
            value={repliedCount}
            valueClass="text-green-600"
          />

          <StatCard
            label="Rejected"
            value={rejectedCount}
            valueClass="text-red-600"
          />
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* SEARCH + FILTER */}
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_250px_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Search Enquiries
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, mobile, email, subject..."
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Filter by Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="replied">Replied</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredEnquiries.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">
              {totalCount}
            </span>{" "}
            enquiries
          </div>
        </section>

        {/* CONTENT */}
        <section className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Loading enquiries...
              </p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">📭</div>

              <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                No enquiries found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are no enquiries matching your current search
                or filter.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredEnquiries.map((enquiry, index) => (
                <EnquiryCard
                  key={enquiry.id}
                  enquiry={enquiry}
                  index={index}
                  actionLoading={actionLoading}
                  onView={() => setSelectedEnquiry(enquiry)}
                  onEmail={() => openEmailReply(enquiry)}
                  onWhatsApp={() => openWhatsAppReply(enquiry)}
                  onCall={() => callPerson(enquiry)}
                  onReply={() => markAsReplied(enquiry)}
                  onReject={() => rejectEnquiry(enquiry)}
                  onMarkNew={() => markAsNew(enquiry)}
                  formatDate={formatDate}
                  getStatusLabel={getStatusLabel}
                  getStatusClass={getStatusClass}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* DETAIL MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-green-700">
                  ENQUIRY DETAILS
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                  {selectedEnquiry.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-full bg-gray-100 px-3 py-2 text-lg font-bold text-slate-700 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Name"
                  value={selectedEnquiry.name}
                />

                <DetailItem
                  label="Mobile"
                  value={selectedEnquiry.mobile || "Not provided"}
                />

                <DetailItem
                  label="Email"
                  value={selectedEnquiry.email || "Not provided"}
                />

                <DetailItem
                  label="Subject"
                  value={selectedEnquiry.subject || "No subject"}
                />

                <DetailItem
                  label="Received"
                  value={formatDate(selectedEnquiry.created_at)}
                />

                <DetailItem
                  label="Status"
                  value={getStatusLabel(selectedEnquiry.status)}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Message
                </p>

                <div className="whitespace-pre-wrap rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-slate-700">
                  {selectedEnquiry.message || "No message provided."}
                </div>
              </div>

              {selectedEnquiry.rejection_reason && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                    Rejection Reason
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
                    {selectedEnquiry.rejection_reason}
                  </p>
                </div>
              )}

              {selectedEnquiry.replied_at && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                    Replied At
                  </p>

                  <p className="mt-2 text-sm font-semibold text-green-800">
                    {formatDate(selectedEnquiry.replied_at)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openEmailReply(selectedEnquiry)}
                  className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                >
                  ✉ Reply by Email
                </button>

                <button
                  type="button"
                  onClick={() => openWhatsAppReply(selectedEnquiry)}
                  className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                >
                  💬 Reply on WhatsApp
                </button>

                {selectedEnquiry.mobile && (
                  <button
                    type="button"
                    onClick={() => callPerson(selectedEnquiry)}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    📞 Call
                  </button>
                )}

                {selectedEnquiry.status !== "replied" && (
                  <button
                    type="button"
                    disabled={actionLoading === selectedEnquiry.id}
                    onClick={() => markAsReplied(selectedEnquiry)}
                    className="rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:opacity-50"
                  >
                    {actionLoading === selectedEnquiry.id
                      ? "Updating..."
                      : "✓ Mark as Replied"}
                  </button>
                )}

                {selectedEnquiry.status !== "rejected" && (
                  <button
                    type="button"
                    disabled={actionLoading === selectedEnquiry.id}
                    onClick={() => rejectEnquiry(selectedEnquiry)}
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    ✕ Reject Enquiry
                  </button>
                )}

                {selectedEnquiry.status !== "new" && (
                  <button
                    type="button"
                    disabled={actionLoading === selectedEnquiry.id}
                    onClick={() => markAsNew(selectedEnquiry)}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    ↺ Mark as New
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-4xl font-extrabold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EnquiryCard({
  enquiry,
  index,
  actionLoading,
  onView,
  onEmail,
  onWhatsApp,
  onCall,
  onReply,
  onReject,
  onMarkNew,
  formatDate,
  getStatusLabel,
  getStatusClass,
}: {
  enquiry: Enquiry;
  index: number;
  actionLoading: string | null;
  onView: () => void;
  onEmail: () => void;
  onWhatsApp: () => void;
  onCall: () => void;
  onReply: () => void;
  onReject: () => void;
  onMarkNew: () => void;
  formatDate: (date: string | null) => string;
  getStatusLabel: (status: string | null) => string;
  getStatusClass: (status: string | null) => string;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b border-gray-100 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              💬
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold tracking-wider text-green-700">
                  ENQUIRY #{index + 1}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                    enquiry.status
                  )}`}
                >
                  {getStatusLabel(enquiry.status)}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                {enquiry.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Received:{" "}
                <span className="font-semibold text-slate-700">
                  {formatDate(enquiry.created_at)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {enquiry.mobile && (
              <button
                type="button"
                onClick={onCall}
                className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                📞 Call
              </button>
            )}

            {enquiry.mobile && (
              <button
                type="button"
                onClick={onWhatsApp}
                className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-100"
              >
                💬 WhatsApp
              </button>
            )}

            {enquiry.email && (
              <button
                type="button"
                onClick={onEmail}
                className="rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 transition hover:bg-purple-100"
              >
                ✉ Email
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Mobile
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-slate-900">
            {enquiry.mobile || "Not provided"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Email
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-slate-900">
            {enquiry.email || "Not provided"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Subject
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-slate-900">
            {enquiry.subject || "No subject"}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Message
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {enquiry.message || "No message provided."}
          </p>
        </div>

        {enquiry.rejection_reason && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">
              Rejection Reason
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-800">
              {enquiry.rejection_reason}
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onView}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            👁 View Full Details
          </button>

          {enquiry.status !== "replied" && (
            <button
              type="button"
              disabled={actionLoading === enquiry.id}
              onClick={onReply}
              className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {actionLoading === enquiry.id
                ? "Updating..."
                : "✓ Mark as Replied"}
            </button>
          )}

          {enquiry.status !== "rejected" && (
            <button
              type="button"
              disabled={actionLoading === enquiry.id}
              onClick={onReject}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              ✕ Reject
            </button>
          )}

          {enquiry.status !== "new" && (
            <button
              type="button"
              disabled={actionLoading === enquiry.id}
              onClick={onMarkNew}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              ↺ Mark as New
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
