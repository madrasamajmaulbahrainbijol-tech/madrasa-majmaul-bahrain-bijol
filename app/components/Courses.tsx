"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  image_url: string | null;
};

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      const { data } = await supabase
        .from("courses")
        .select("id,name,description,duration,image_url")
        .eq("active", true)
        .order("created_at", { ascending: true })
        .limit(6);

      if (mounted) {
        setCourses((data || []) as Course[]);
        setLoading(false);
      }
    }

    loadCourses().catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="courses" className="bg-white px-6 py-24 md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-bold uppercase tracking-widest text-green-600">Our Courses</p>
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">Courses We Offer</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">We provide both Islamic and modern education to prepare students for success in this world and the Hereafter.</p>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" /></div>
        ) : courses.length === 0 ? (
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-green-100 bg-green-50 p-10 text-center">
            <div className="text-5xl">📚</div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">Courses will be updated soon</h3>
            <p className="mt-2 text-gray-600">Our current courses will appear here after they are published by the madrasa.</p>
          </div>
        ) : (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:border-green-600 hover:shadow-2xl">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-green-100 text-3xl">
                  {course.image_url ? <img src={course.image_url} alt="" className="h-full w-full object-cover" /> : "📖"}
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">{course.name}</h3>
                <p className="mt-4 leading-8 text-gray-600">{course.description || "Course details will be available soon."}</p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">{course.duration || "Regular"}</span>
                  <Link href="/courses" className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700">Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/courses" className="inline-flex rounded-xl bg-green-700 px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-green-800">View All Courses →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
