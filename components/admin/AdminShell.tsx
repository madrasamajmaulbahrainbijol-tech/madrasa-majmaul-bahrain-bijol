"use client";

import { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type NavItem = { label: string; href: string; icon: string };
const groups: { title: string; items: NavItem[] }[] = [
  { title: "OVERVIEW", items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "⌂" }] },
  { title: "STUDENT MANAGEMENT", items: [
    { label: "Take Admission", href: "/admin/admissions/take", icon: "+" },
    { label: "Admissions", href: "/admin/admissions", icon: "▤" },
    { label: "Students", href: "/admin/students", icon: "♙" },
    { label: "Attendance", href: "/admin/attendance", icon: "◷" },
    { label: "Bulk Print", href: "/admin/bulk-print", icon: "▧" },
  ]},
  { title: "FINANCE & ACCOUNTS", items: [
    { label: "Fee Accounts", href: "/admin/fee-account", icon: "₹" },
    { label: "Staff Accounts", href: "/admin/staff-account", icon: "▣" },
    { label: "Financial Years", href: "/admin/financial-years", icon: "◷" },
  ]},
  { title: "ACADEMICS", items: [
    { label: "Results & Marksheets", href: "/admin/results", icon: "▥" },
    { label: "Toppers", href: "/admin/toppers", icon: "♛" },
    { label: "Courses", href: "/admin/courses", icon: "▦" },
    { label: "Teachers & Staff", href: "/admin/teachers", icon: "♧" },
  ]},
  { title: "COMMUNICATION", items: [
    { label: "WhatsApp", href: "/admin/whatsapp", icon: "◉" },
    { label: "Notices", href: "/admin/notices", icon: "⚑" },
    { label: "Enquiries", href: "/admin/enquiries", icon: "✉" },
  ]},
  { title: "ADMINISTRATION", items: [
    { label: "Admin Users", href: "/admin/admin-users", icon: "♙" },
    { label: "Donate Page", href: "/admin/donate", icon: "♡" },
  ]},
];

export default function AdminShell({ children, email }: { children: ReactNode; email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logout() {
    const { supabase } = await import("@/lib/supabase/client");
    await supabase.auth.signOut();
    router.replace("/admin");
    router.refresh();
  }

  function Sidebar() {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg">
            <img src="/mmbb-logo.svg" alt="MMBB" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">MMBB • ADMIN</p>
            <p className="mt-1 text-sm font-extrabold leading-5 text-white">Madrasa Majmaul<br/>Bahrain Bijol</p>
          </div>
        </div>
        <nav className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[9px] font-black tracking-[0.2em] text-emerald-300/70">{group.title}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
                  return (
                    <button key={item.href} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${active ? "bg-white/15 text-white shadow-inner ring-1 ring-white/10" : "text-emerald-50/75 hover:bg-white/10 hover:text-white"}`}>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/5 text-emerald-100/70 group-hover:bg-white/10"}`}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Signed in as</p>
            <p className="mt-1 truncate text-xs font-semibold text-white">{email || "Administrator"}</p>
          </div>
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-100 transition hover:bg-red-500/20">↪ Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf4ef] text-slate-800">
      <style jsx global>{`
        .admin-glass { background:linear-gradient(135deg,rgba(255,255,255,.94),rgba(222,245,234,.88)); border:1px solid rgba(255,255,255,.96); box-shadow:0 14px 38px rgba(10,75,48,.10); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); }
        .sidebar-scroll { scrollbar-width:thin; scrollbar-color:rgba(167,243,208,.25) transparent; }
        .admin-grid-bg { background-color:#eaf4ef; background-image:radial-gradient(rgba(16,110,70,.13) 1px, transparent 1px),linear-gradient(135deg,rgba(219,245,231,.55),rgba(239,244,255,.62)); background-size:22px 22px,100% 100%; }
        .admin-grid-bg .admin-glass { box-shadow:0 16px 42px rgba(13,78,53,.11); }
      `}</style>

      {sidebarOpen && <div className="fixed inset-0 z-[60]">
        <button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className="absolute inset-y-0 left-0 flex w-[286px] max-w-[88vw] flex-col bg-gradient-to-b from-[#073d2b] via-[#075238] to-[#062f23] shadow-2xl sm:w-[300px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-200">Navigation menu</span>
            <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation" className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/20">✕</button>
          </div>
          <div className="min-h-0 flex-1"><Sidebar /></div>
        </aside>
      </div>}

      <div className="min-h-screen">
        <header className="admin-glass sticky top-0 z-40 flex h-[70px] items-center justify-between px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" aria-expanded={sidebarOpen}
              className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 text-emerald-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="h-[2px] w-5 rounded-full bg-current" />
              <span className="h-[2px] w-5 rounded-full bg-current" />
              <span className="h-[2px] w-5 rounded-full bg-current" />
            </button>
            <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">MADRASA MANAGEMENT</p><p className="truncate text-sm font-extrabold text-slate-800">Administration Workspace</p></div>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-[10px] font-bold text-emerald-900 sm:text-xs"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]"/> System Online</div>
        </header>
        <div className="admin-grid-bg min-h-[calc(100vh-70px)]">{children}</div>
      </div>
    </div>
  );
}
