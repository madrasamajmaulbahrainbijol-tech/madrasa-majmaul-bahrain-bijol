import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-gradient-to-b from-gray-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="font-bold uppercase tracking-[4px] text-green-600">
            Contact Us
          </p>

          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Get In Touch
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Feel free to contact us for admission, enquiries or any
            information regarding the Madrasa.
          </p>

        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">

          {/* LEFT SIDE */}

          <div className="space-y-8">

            {/* Address */}

            <div className="rounded-3xl bg-white p-8 shadow-xl">

              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-green-100 p-4 text-2xl text-green-700">
                  <FaMapMarkerAlt />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Address
                </h3>

              </div>

              <p className="mt-6 leading-8 text-gray-700">

                Madrasa Majmaul Bahrain Bijol

                <br />

                Village : Bijol

                <br />

                Post : Madhepur

                <br />

                Police Station : Telta

                <br />

                District : Katihar

                <br />

                Bihar - 854317

                <br />

                India

              </p>

            </div>

            {/* Contact Details */}

            <div className="rounded-3xl bg-white p-8 shadow-xl">

              <h3 className="text-2xl font-bold text-gray-900">
                Contact Details
              </h3>

              <div className="mt-8 space-y-5">

                <a
                  href="tel:+919076699707"
                  className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-4 transition hover:bg-green-100"
                >
                  <FaPhoneAlt className="text-green-700" />

                  <div>

                    <p className="text-sm text-gray-500">
                      Primary Number
                    </p>

                    <p className="font-bold text-gray-900">
                      +91 9076699707
                    </p>

                  </div>

                </a>                <a
                  href="tel:+917050715178"
                  className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-4 transition hover:bg-green-100"
                >
                  <FaPhoneAlt className="text-green-700" />

                  <div>
                    <p className="text-sm text-gray-500">
                      Secondary Number
                    </p>

                    <p className="font-bold text-gray-900">
                      +91 7050715178
                    </p>
                  </div>
                </a>

                <a
                  href="https://wa.me/917050715078"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-4 transition hover:bg-green-100"
                >
                  <FaWhatsapp className="text-2xl text-green-600" />

                  <div>
                    <p className="text-sm text-gray-500">
                      WhatsApp
                    </p>

                    <p className="font-bold text-gray-900">
                      +91 7050715078
                    </p>
                  </div>
                </a>

                <a
                  href="mailto:madrasamajmaulbahrainbijol@gmail.com"
                  className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-4 transition hover:bg-green-100"
                >
                  <FaEnvelope className="text-xl text-red-600" />

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="break-all font-bold text-gray-900">
                      madrasamajmaulbahrainbijol@gmail.com
                    </p>
                  </div>
                </a>

              </div>

            </div>

            {/* Office Timing */}

            <div className="rounded-3xl bg-white p-8 shadow-xl">

              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-green-100 p-4 text-2xl text-green-700">
                  <FaClock />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Office Timing
                </h3>

              </div>

              <p className="mt-6 text-lg font-semibold text-gray-700">
                Saturday - Thursday
              </p>

              <p className="mt-2 text-gray-600">
                07:00 AM - 04:00 PM
              </p>

            </div>

            {/* Social Media */}

            <div className="rounded-3xl bg-white p-8 shadow-xl">

              <h3 className="text-2xl font-bold text-gray-900">
                Follow Us
              </h3>

              <div className="mt-6 flex gap-5">

                <a
                  href="https://www.facebook.com/profile.php?id=61590298682419"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white transition hover:scale-110"
                >
                  <FaFacebookF />
                </a>

                <a
                  href="https://www.instagram.com/madrasa_majmaul_bahrain_bijol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-600 text-2xl text-white transition hover:scale-110"
                >
                  <FaInstagram />
                </a>

              </div>

            </div>

          </div>          {/* RIGHT SIDE */}

          <div className="space-y-8">

            {/* Enquiry Form */}

            <div className="rounded-3xl bg-white p-8 shadow-xl">

              <h3 className="text-3xl font-bold text-gray-900">
                Send Enquiry
              </h3>

              <p className="mt-3 text-gray-600">
                Fill out the form below and we'll contact you as soon as possible.
              </p>

              <form className="mt-8 space-y-5">

                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600"
                />

                <input
                  type="text"
                  placeholder="Father's Name"
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600"
                />

                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600"
                />

                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600"
                />

                <textarea
                  rows={6}
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600"
                ></textarea>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition hover:bg-green-700"
                >
                  Send Message
                </button>

              </form>

            </div>

            {/* Google Map */}

            <div className="overflow-hidden rounded-3xl shadow-xl">              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7185.7962225150395!2d87.82260417938231!3d25.7739287524233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e549bbc112b099%3A0x746c4a891e90160a!2sMadrasa%20Majmaul%20bahrain%20bijol!5e0!3m2!1sen!2sin!4v1785934589819!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title="Madrasa Majmaul Bahrain Bijol"
              ></iframe>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}