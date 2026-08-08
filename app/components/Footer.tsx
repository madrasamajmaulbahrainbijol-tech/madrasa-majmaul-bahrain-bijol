import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowUp,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">

      {/* Top Footer */}

      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* About */}

          <div>

            <h2 className="text-3xl font-extrabold text-green-500">
              Madrasa Majmaul Bahrain
            </h2>

            <p className="mt-2 text-lg text-green-300">
              Bijol
            </p>

            <div className="mt-5 h-1 w-20 rounded-full bg-green-600"></div>

            <p className="mt-6 leading-8 text-gray-300">

              Madrasa Majmaul Bahrain Bijol is committed to
              providing authentic Islamic education together
              with modern academic learning in a peaceful,
              disciplined and inspiring environment.

            </p>

            <div className="mt-8 flex gap-4">

              <a
                href="https://www.facebook.com/profile.php?id=61590298682419"
                target="_blank"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl transition hover:scale-110"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.instagram.com/madrasa_majmaul_bahrain_bijol"
                target="_blank"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 text-xl transition hover:scale-110"
              >
                <FaInstagram />
              </a>

              <a
                href="https://wa.me/917050715078"
                target="_blank"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-xl transition hover:scale-110"
              >
                <FaWhatsapp />
              </a>

            </div>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-2xl font-bold">
              Quick Links
            </h3>

            <div className="mt-4 h-1 w-16 rounded-full bg-green-600"></div>

            <ul className="mt-8 space-y-4 text-gray-300">

              <li>
                <Link href="/" className="hover:text-green-400">
                  Home
                </Link>
              </li>

              <li>
                <a href="#about" className="hover:text-green-400">
                  About
                </a>
              </li>

              <li>
                <a href="#courses" className="hover:text-green-400">
                  Courses
                </a>
              </li>

              <li>
                <a href="#teachers" className="hover:text-green-400">
                  Teachers
                </a>
              </li>

              <li>
                <a href="#gallery" className="hover:text-green-400">
                  Gallery
                </a>
              </li>

              <li>
                <a href="#contact" className="hover:text-green-400">
                  Contact
                </a>
              </li>

            </ul>

          </div>          {/* Courses */}

          <div>

            <h3 className="text-2xl font-bold">
              Our Courses
            </h3>

            <div className="mt-4 h-1 w-16 rounded-full bg-green-600"></div>

            <ul className="mt-8 space-y-4 text-gray-300">

              <li className="hover:text-green-400 transition">
                Nazrah & Qirat
              </li>

              <li className="hover:text-green-400 transition">
                Hifz-ul-Quran
              </li>

              <li className="hover:text-green-400 transition">
                Darse Nizami
              </li>

              <li className="hover:text-green-400 transition">
                English Education
              </li>

              <li className="hover:text-green-400 transition">
                Mathematics
              </li>

              <li className="hover:text-green-400 transition">
                Basic Science
              </li>

              <li className="hover:text-green-400 transition">
                Moral Education
              </li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-2xl font-bold">
              Contact Info
            </h3>

            <div className="mt-4 h-1 w-16 rounded-full bg-green-600"></div>

            <div className="mt-8 space-y-6">

              <div className="flex items-start gap-4">

                <FaMapMarkerAlt className="mt-1 text-xl text-green-500" />

                <p className="leading-7 text-gray-300">

                  Madrasa Majmaul Bahrain Bijol
                  <br />
                  Village: Bijol
                  <br />
                  Post: Madhepur
                  <br />
                  P.S.: Telta
                  <br />
                  District: Katihar
                  <br />
                  Bihar - 854317
                  <br />
                  India

                </p>

              </div>

              <div className="flex items-center gap-4">

                <FaPhoneAlt className="text-green-500" />

                <a
                  href="tel:+919076699707"
                  className="text-gray-300 hover:text-green-400"
                >
                  +91 9076699707
                </a>

              </div>

              <div className="flex items-center gap-4">

                <FaPhoneAlt className="text-green-500" />

                <a
                  href="tel:+917050715178"
                  className="text-gray-300 hover:text-green-400"
                >
                  +91 7050715178
                </a>

              </div>

              <div className="flex items-center gap-4">

                <FaEnvelope className="text-green-500" />

                <a
                  href="mailto:madrasamajmaulbahrainbijol@gmail.com"
                  className="break-all text-gray-300 hover:text-green-400"
                >
                  madrasamajmaulbahrainbijol@gmail.com
                </a>

              </div>

            </div>

          </div>

        </div>

      </div>      {/* Bottom Footer */}

      <div className="border-t border-gray-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">

          <div className="text-center md:text-left">

            <p className="text-sm text-gray-400">
              © 2026 Madrasa Majmaul Bahrain Bijol.
              <span className="font-semibold text-white">
                {" "}All Rights Reserved.
              </span>
            </p>

            <p className="mt-2 text-sm leading-7 text-gray-500">
              Designed, Developed &amp; Maintained by
              <br />
              <span className="font-semibold text-green-400">
                Madrasa Majmaul Bahrain Social Media &amp; Technical Team
              </span>
            </p>

          </div>

          {/* Back To Top */}

          <a
            href="#"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-xl text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-green-500"
            aria-label="Back to Top"
          >
            <FaArrowUp />
          </a>

        </div>

      </div>

    </footer>
  );
}