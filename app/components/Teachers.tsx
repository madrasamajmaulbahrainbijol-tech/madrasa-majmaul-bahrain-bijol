"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  image_url: string | null;
  short_details: string | null;
  display_order: number;
  active: boolean;
};

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select(
          "id, name, subject, image_url, short_details, display_order, active"
        )
        .eq("active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Teachers loading error:", error);
        setTeachers([]);
        return;
      }

      setTeachers(data || []);
    } catch (error) {
      console.error("Teachers error:", error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="teachers"
      className="bg-gradient-to-b from-white via-gray-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* =========================
            SECTION HEADING
        ========================== */}
        <div className="mb-16 text-center">
          <p className="font-semibold uppercase tracking-[4px] text-green-600">
            Our Faculty
          </p>

          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Meet Our Teachers
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Our experienced teachers are committed to nurturing Islamic
            values along with quality education for every student.
          </p>
        </div>

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
          </div>
        )}

        {/* =========================
            NO TEACHERS
        ========================== */}
        {!loading && teachers.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">👨‍🏫</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Our teachers will be displayed here
            </h3>

            <p className="mt-2 text-gray-500">
              Teacher information is currently being updated.
            </p>
          </div>
        )}

        {/* =========================
            TEACHER CARDS
        ========================== */}
        {!loading && teachers.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group overflow-hidden rounded-[40px] border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-green-200 hover:shadow-xl"
              >
                {/* =========================
                    TEACHER IMAGE
                ========================== */}
                <div className="relative h-72 w-full overflow-hidden rounded-[30px] bg-gray-100">
                  {teacher.image_url ? (
                    <img
                      src={teacher.image_url}
                      alt={teacher.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      onError={(event) => {
                        const image = event.currentTarget;

                        image.style.display = "none";

                        const parent = image.parentElement;

                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex h-full w-full items-center justify-center text-6xl">
                              👨‍🏫
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl">
                      👨‍🏫
                    </div>
                  )}
                </div>

                {/* =========================
                    TEACHER INFORMATION
                ========================== */}
                <div className="px-2 pb-3 pt-6">
                  <h3 className="text-center text-xl font-bold leading-8 text-gray-900">
                    {teacher.name}
                  </h3>

                  <div className="mx-auto my-4 h-1 w-14 rounded-full bg-green-600"></div>

                  <p className="text-center text-sm font-semibold leading-7 text-green-700">
                    {teacher.subject}
                  </p>

                  {teacher.short_details && (
                    <p className="mt-3 text-center text-sm leading-6 text-gray-500">
                      {teacher.short_details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
