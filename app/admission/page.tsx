"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

export default function AdmissionPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    father_name: "",
    phone: "",
    email: "",
    course: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const cleanData = {
        full_name: formData.full_name.trim(),
        father_name: formData.father_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        course: formData.course.trim(),
        message: formData.message.trim(),
      };

      if (!cleanData.full_name) {
        throw new Error("Student full name is required.");
      }

      if (!cleanData.father_name) {
        throw new Error("Father / Guardian name is required.");
      }

      if (!cleanData.phone) {
        throw new Error("Mobile number is required.");
      }

      if (!cleanData.course) {
        throw new Error("Please select a course.");
      }

      console.log("Admission form data:", cleanData);

      setSuccessMessage(
        "Form successfully filled. Backend connection next step mein connect ki jayegi."
      );

      setFormData({
        full_name: "",
        father_name: "",
        phone: "",
        email: "",
        course: "",
        message: "",
      });
    } catch (error) {
      console.error("Admission form error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Admission form submit nahi ho saka. Please dobara try karein."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-r from-green-950 via-green-800 to-green-600 px-6 pb-20 pt-32">
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 mx-auto max-w-5xl text-center text-white">
          <p className="mb-5 text-sm font-bold uppercase tracking-[5px] text-green-200 sm:text-lg">
            Admissions 2026
          </p>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Admission Open
            <br />
            <span className="text-green-100">
              Madrasa Majmaul Bahrain Bijol
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-green-100 sm:text-lg">
            Join an institution dedicated to Islamic values, quality
            education, discipline and character building. Admissions are
            now open for the academic session 2026.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#apply"
              className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-green-700 shadow-xl transition hover:scale-105"
            >
              Apply Now
            </a>

            <Link
              href="/courses"
              className="rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-green-700"
            >
              View Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ADMISSION INFORMATION */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="font-semibold uppercase tracking-[4px] text-green-600">
              Admission Information
            </p>

            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Join Our Madrasa?
            </h2>

            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Islamic Education
              </h3>

              <p className="leading-8 text-gray-700">
                Quran, Hifz, Nazrah, Qirat and Darse Nizami under
                qualified scholars.
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Modern Education
              </h3>

              <p className="leading-8 text-gray-700">
                English, Mathematics, Basic Science and Moral Education
                with experienced teachers.
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Character Building
              </h3>

              <p className="leading-8 text-gray-700">
                Focus on discipline, good manners, leadership and
                Islamic values.
              </p>
            </div>
          </div>

          {/* ELIGIBILITY + DOCUMENTS */}
          <div className="mt-20 grid gap-10 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100 sm:p-10">
              <h2 className="mb-7 text-3xl font-extrabold text-gray-900">
                Eligibility
              </h2>

              <ul className="space-y-5 text-lg leading-8 text-gray-700">
                <li>
                  ✅ Boys seeking quality Islamic and Modern Education.
                </li>
                <li>✅ Good moral character and discipline.</li>
                <li>✅ Previous academic record if applicable.</li>
                <li>✅ Parent/Guardian consent is mandatory.</li>
                <li>✅ Admission is subject to seat availability.</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100 sm:p-10">
              <h2 className="mb-7 text-3xl font-extrabold text-gray-900">
                Required Documents
              </h2>

              <ul className="space-y-5 text-lg leading-8 text-gray-700">
                <li>📄 Birth Certificate</li>
                <li>📄 Aadhaar Card</li>
                <li>📄 Previous School Certificate</li>
                <li>📄 Passport Size Photographs</li>
                <li>📄 Parent/Guardian Aadhaar</li>
                <li>📄 Residence Proof</li>
              </ul>
            </div>
          </div>

          {/* ADMISSION PROCESS */}
          <div className="mt-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Admission Process
              </h2>

              <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">1️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Fill Form
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Complete the admission form with correct details.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">2️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Submit Documents
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Submit all required documents for verification.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">3️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Verification
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Documents and eligibility will be verified.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">4️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Admission Confirmed
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  After approval, admission will be confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* APPLICATION FORM */}
          <section
            id="apply"
            className="mt-24 rounded-[2rem] bg-gradient-to-br from-green-950 via-green-800 to-green-700 p-6 shadow-2xl sm:p-10 lg:p-14"
          >
            <div className="mx-auto max-w-4xl">
              <div className="text-center text-white">
                <p className="font-semibold uppercase tracking-[4px] text-green-200">
                  Online Admission
                </p>

                <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                  Apply for Admission
                </h2>

                <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-100">
                  Please fill in the form below carefully. Our office team
                  will review your application and contact you.
                </p>
              </div>

              {successMessage && (
                <div className="mt-8 rounded-2xl bg-green-100 p-5 text-center font-semibold text-green-800">
                  ✅ {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mt-8 rounded-2xl bg-red-100 p-5 text-center font-semibold text-red-700">
                  ❌ {errorMessage}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-10 rounded-3xl bg-white p-6 shadow-2xl sm:p-10"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {/* FULL NAME */}
                  <div>
                    <label
                      htmlFor="full_name"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Student Full Name *
                    </label>

                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter student's full name"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* FATHER NAME */}
                  <div>
                    <label
                      htmlFor="father_name"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Father / Guardian Name *
                    </label>

                    <input
                      id="father_name"
                      name="father_name"
                      type="text"
                      required
                      value={formData.father_name}
                      onChange={handleChange}
                      placeholder="Enter father/guardian name"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Mobile Number *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* COURSE */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="course"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Course / Program *
                    </label>

                    <select
                      id="course"
                      name="course"
                      required
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    >
                      <option value="" className="text-gray-400">
                        Select a course
                      </option>

                      <option value="Hifz-ul-Quran">
                        Hifz-ul-Quran
                      </option>

                      <option value="Nazrah & Qirat">
                        Nazrah & Qirat
                      </option>

                      <option value="Darse Nizami">
                        Darse Nizami
                      </option>

                      <option value="Modern Education">
                        Modern Education
                      </option>
                    </select>
                  </div>

                  {/* MESSAGE */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="message"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Additional Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Any additional information..."
                      className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 w-full rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Submit Admission Form"}
                </button>
              </form>
            </div>
          </section>

          {/* CONTACT CTA */}
          <section className="mt-20 rounded-3xl bg-gray-900 px-6 py-14 text-center text-white shadow-2xl sm:px-10">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Need More Information?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-300">
              If you have any questions regarding admission, courses or
              documents, please contact our office team.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/#contact"
                className="rounded-xl bg-green-600 px-8 py-4 font-bold transition hover:bg-green-700"
              >
                Contact Office
              </Link>

              <Link
                href="/courses"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold transition hover:bg-white hover:text-gray-900"
              >
                View Courses
              </Link>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  );
}
