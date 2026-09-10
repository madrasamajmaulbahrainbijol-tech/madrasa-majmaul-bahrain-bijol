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
    <section id="toppers" className="overflow-hidden bg-gradient-to-b from-amber-50 via-white to-green-50 py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center">
          <p className="font-bold uppercase tracking-[4px] text-amber-600">Academic Excellence</p>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 md:text-5xl">Our Toppers</h2>
          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-amber-500" />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">We proudly celebrate the students who achieved outstanding results in their examinations.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-100 to-amber-50">
                {item.photo_url ? <img src={item.photo_url} alt={item.student_name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-7xl">🎓</div>}
                <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-4 py-2 text-sm font-black text-white shadow-lg">Rank {item.rank}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-extrabold text-gray-900">{item.student_name}</h3>
                {item.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{item.description}</p>}
                {(item.exam_name || item.course || item.exam_date) && <div className="mt-5 space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
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
