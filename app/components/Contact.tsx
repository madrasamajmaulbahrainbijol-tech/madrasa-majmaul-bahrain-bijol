"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase/client";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("enquiries").insert([
        {
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim() || null,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          status: "new",
        },
      ]);

      if (error) {
        console.error("Supabase enquiry error:", error);

        setErrorMessage(
          error.message ||
            "Your enquiry could not be submitted. Please try again."
        );

        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Thank you! Your enquiry has been submitted successfully. Our office team will contact you soon."
      );

      setFormData({
        name: "",
        mobile: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Unexpected enquiry error:", error);

      setErrorMessage(
        "Something went wrong while submitting your enquiry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full bg-white py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-green-700">
            Contact Us
          </p>

          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
            Get In Touch With Us
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            Have a question about admission, courses, timings or anything
            else? Send us an enquiry and our office team will contact you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-3xl bg-gradient-to-br from-green-950 via-green-900 to-green-700 p-6 text-white shadow-xl md:p-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-green-200">
              Madrasa Majmaul Bahrain Bijol
            </p>

            <h3 className="text-3xl font-extrabold leading-tight md:text-4xl">
              We are here to help you.
            </h3>

            <p className="mt-5 leading-7 text-green-50">
              For admission enquiries, course information, general questions
              or any other assistance, please contact our office.
            </p>

            <div className="mt-8 space-y-5">
              {/* Mobile */}
              <a
                href="tel:09534715178"
                className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl">
                  📞
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-200">
                    Phone
                  </p>

                  <p className="mt-1 font-bold text-white">
                    09534715178
                  </p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/919534715178"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl">
                  💬
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-200">
                    WhatsApp
                  </p>

                  <p className="mt-1 font-bold text-white">
                    Chat with us on WhatsApp
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:madrasamajmaulbahrainbijol@gmail.com"
                className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl">
                  ✉️
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-200">
                    Email
                  </p>

                  <p className="mt-1 break-all font-bold text-white">
                    madrasamajmaulbahrainbijol@gmail.com
                  </p>
                </div>
              </a>

              {/* Office Timing */}
              <div className="flex items-start gap-4 rounded-2xl bg-white/10 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl">
                  🕐
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-200">
                    Office Timing
                  </p>

                  <p className="mt-1 font-bold text-white">
                    Saturday to Thursday
                  </p>

                  <p className="text-green-100">
                    07:00 AM – 04:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 border-t border-white/20 pt-7">
              <p className="mb-4 text-sm font-semibold text-green-200">
                Follow Us
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
                >
                  Facebook
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
                >
                  Instagram
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl md:p-10">
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
                Online Enquiry
              </p>

              <h3 className="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
                Send Us An Enquiry
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
                Fill in the form below and our office team will get back to
                you.
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">✅</span>

                  <div>
                    <p className="font-bold text-green-800">
                      Enquiry Submitted
                    </p>

                    <p className="mt-1 text-sm leading-6 text-green-700">
                      {successMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">❌</span>

                  <div>
                    <p className="font-bold text-red-800">
                      Submission Failed
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Mobile */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-gray-800"
                  >
                    Your Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="mb-2 block text-sm font-bold text-gray-800"
                  >
                    Mobile Number *
                  </label>

                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Subject *
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is your enquiry about?"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Your Message *
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your enquiry here..."
                  required
                  rows={6}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-700 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting Enquiry..." : "Submit Enquiry →"}
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                Your information will be used only for responding to your
                enquiry.
              </p>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-200 px-6 py-5 md:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Our Location
            </p>

            <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
              Find Us On Map
            </h3>
          </div>

          <div className="h-[350px] w-full md:h-[450px]">
            <iframe
              src="https://www.google.com/maps?q=Bijol&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Madrasa Majmaul Bahrain Bijol Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
