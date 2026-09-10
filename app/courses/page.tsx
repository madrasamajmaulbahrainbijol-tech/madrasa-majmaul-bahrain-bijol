"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  image_url: string | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      const { data } = await supabase
        .from("courses")
        .select("id,name,description,duration,image_url")
        .eq("active", true)
        .order("created_at", { ascending: true });

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
    <>
      <Navbar />
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-r from-green-900 via-green-700 to-green-600 px-6 pt-28 pb-20">
        <div className="max-w-5xl text-center text-white">
          <p className="mb-4 text-lg font-semibold uppercase tracking-[5px] text-green-200">Our Courses</p>
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">Islamic &amp; Modern<br />Education Programs</h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-green-100">We provide a balanced education where students receive authentic Islamic knowledge together with modern academic education for a bright future.</p>
          <div className="mt-10 flex flex-col justify-center gap-5 sm:flex-row">
            <Link href="/admission" className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-green-700 transition hover:scale-105">Apply For Admission</Link>
            <a href="/#contact" className="rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-green-700">Contact Us</a>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-semibold uppercase tracking-[4px] text-green-600">Academic Programs</p>
            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">Courses We Offer</h2>
            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600" />
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">Our curriculum combines Islamic values with quality modern education to help students become knowledgeable, confident and responsible.</p>
          </div>

          {loading ? (
            <div className="mt-16 flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" /></div>
          ) : courses.length === 0 ? (
            <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-green-100 bg-green-50 p-12 text-center">
              <div className="text-5xl">📚</div>
              <h3 className="mt-5 text-2xl font-bold text-gray-900">Courses will be updated soon</h3>
              <p className="mt-3 text-gray-600">Our latest academic programs will appear here as soon as they are published.</p>
            </div>
          ) : (
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-4xl shadow-sm">
                    {course.image_url ? <img src={course.image_url} alt="" className="h-full w-full object-cover" /> : "📖"}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-green-700">{course.name}</h3>
                  <p className="mt-4 leading-8 text-gray-700">{course.description || "Detailed information about this course will be available soon."}</p>
                  {course.duration && <span className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm">{course.duration}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="mt-24">
            <div className="text-center"><h2 className="text-4xl font-extrabold text-gray-900">Why Study With Us?</h2><div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600" /></div>
            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-white p-8 text-center shadow-lg"><div className="text-5xl">📖</div><h3 className="mt-6 text-xl font-bold">Islamic Values</h3><p className="mt-4 leading-7 text-gray-600">Strong Islamic foundation with authentic teachings.</p></div>
              <div className="rounded-3xl bg-white p-8 text-center shadow-lg"><div className="text-5xl">👨‍🏫</div><h3 className="mt-6 text-xl font-bold">Qualified Teachers</h3><p className="mt-4 leading-7 text-gray-600">Experienced faculty dedicated to every student.</p></div>
              <div className="rounded-3xl bg-white p-8 text-center shadow-lg"><div className="text-5xl">🏆</div><h3 className="mt-6 text-xl font-bold">Quality Education</h3><p className="mt-4 leading-7 text-gray-600">Islamic and modern education under one roof.</p></div>
              <div className="rounded-3xl bg-white p-8 text-center shadow-lg"><div className="text-5xl">🌱</div><h3 className="mt-6 text-xl font-bold">Character Building</h3><p className="mt-4 leading-7 text-gray-600">Discipline, leadership and moral development.</p></div>
            </div>
          </div>

          <div className="mt-24 rounded-3xl bg-gradient-to-r from-green-700 via-green-800 to-green-900 px-8 py-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-extrabold md:text-5xl">Start Your Educational Journey Today</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-green-100">Join Madrasa Majmaul Bahrain Bijol and receive the perfect combination of Islamic education, academic excellence and character development in a peaceful learning environment.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link href="/admission" className="rounded-xl bg-white px-10 py-4 text-lg font-bold text-green-700 transition duration-300 hover:scale-105">Apply For Admission</Link>
              <a href="/#contact" className="rounded-xl border-2 border-white px-10 py-4 text-lg font-bold text-white transition duration-300 hover:bg-white hover:text-green-700">Contact Office</a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
