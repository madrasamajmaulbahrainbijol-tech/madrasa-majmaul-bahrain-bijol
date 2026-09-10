"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Topper = { id: string; student_name: string; rank: string; description: string | null; photo_url: string | null; exam_name: string | null; exam_date: string | null; course: string | null; };

export default function Toppers() {
  const [items, setItems] = useState<Topper[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("toppers").select("id,student_name,rank,description,photo_url,exam_name,exam_date,course").eq("active", true).order("created_at", { ascending: false });
      if (!error) setItems((data || []) as Topper[]);
    }
    load();
  }, []);

  if (!items.length) return null;

  return (
    <section id="toppers" className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-green-50 py-16 md:py-20">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-green-200/30 blur-3xl" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="relative text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3 text-amber-600"><span className="h-px w-12 bg-amber-300" /><span className="text-2xl">🏆</span><span className="h-px w-12 bg-amber-300" /></div>
          <p className="font-bold uppercase tracking-[4px] text-amber-600">Academic Excellence</p>
          <h2 className="mt-2 text-4xl font-extrabold text-gray-900 md:text-5xl">Our Toppers</h2>
          <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">We proudly celebrate the brilliant students whose dedication and hard work have brought honour to our madrasa.</p>
        </div>

        <div className="relative mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="group relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-white shadow-[0_12px_40px_rgba(120,80,10,0.10)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_18px_50px_rgba(120,80,10,0.16)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-green-600" />
              <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 via-white to-amber-100 p-3 pt-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_55%)]" />
                {item.photo_url ? <img src={item.photo_url} alt={item.student_name} className="relative h-full w-full rounded-[1.5rem] object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="relative flex h-full w-full items-center justify-center rounded-[1.5rem] bg-white/70 text-7xl">🎓</div>}
              </div>
              <div className="relative px-5 pb-6 pt-0">
                <div className="-mt-5 flex justify-center">
                  <div className="rounded-full border-4 border-white bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2 text-sm font-black text-white shadow-lg">🏅 Rank {item.rank}</div>
                </div>
                <h3 className="mt-4 text-center text-xl font-extrabold text-gray-900">{item.student_name}</h3>
                {item.description && <p className="mt-3 text-center text-sm leading-6 text-gray-600">{item.description}</p>}
                {(item.exam_name || item.course || item.exam_date) && <div className="mt-5 space-y-2 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 text-sm text-gray-600">
                  {item.exam_name && <p><span className="font-bold text-gray-800">Exam:</span> {item.exam_name}</p>}
                  {item.course && <p><span className="font-bold text-gray-800">Course:</span> {item.course}</p>}
                  {item.exam_date && <p><span className="font-bold text-gray-800">Date:</span> {new Date(`${item.exam_date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>}
                </div>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
