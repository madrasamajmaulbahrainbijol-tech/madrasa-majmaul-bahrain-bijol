"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMenu}
            className="shrink-0 leading-tight"
          >
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              Madrasa
            </h1>

            <p className="text-sm font-semibold text-green-300 sm:text-base lg:text-xl">
              Majmaul Bahrain Bijol
            </p>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            <Link
              href="/"
              className="font-semibold text-white transition hover:text-green-300"
            >
              Home
            </Link>

            <Link
              href="/#about"
              className="font-semibold text-white transition hover:text-green-300"
            >
              About
            </Link>

            <Link
              href="/courses"
              className="font-semibold text-white transition hover:text-green-300"
            >
              Courses
            </Link>

            <Link
              href="/#teachers"
              className="font-semibold text-white transition hover:text-green-300"
            >
              Teachers
            </Link>

            <Link
              href="/#gallery"
              className="font-semibold text-white transition hover:text-green-300"
            >
              Gallery
            </Link>

            <Link
              href="/#contact"
              className="font-semibold text-white transition hover:text-green-300"
            >
              Contact
            </Link>
          </nav>

          {/* DESKTOP RIGHT BUTTONS */}
          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/30 px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-black xl:px-5"
            >
              Student Login
            </Link>

            <Link
              href="/donate"
              className="rounded-xl border border-green-500 px-4 py-2 font-semibold text-green-300 transition hover:bg-green-600 hover:text-white xl:px-5"
            >
              Donate
            </Link>

            <Link
              href="/admission"
              className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-green-500 xl:px-6"
            >
              Admission Open
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-2xl text-white transition hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="border-t border-white/10 py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {/* HOME */}
              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:text-green-300"
              >
                🏠 Home
              </Link>

              {/* ABOUT */}
              <Link
                href="/#about"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:text-green-300"
              >
                ℹ️ About
              </Link>

              {/* COURSES */}
              <Link
                href="/courses"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:text-green-300"
              >
                📚 Courses
              </Link>

              {/* TEACHERS */}
              <Link
                href="/#teachers"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:text-green-300"
              >
                👨‍🏫 Teachers
              </Link>

              {/* GALLERY */}
              <Link
                href="/#gallery"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:text-green-300"
              >
                🖼️ Gallery
              </Link>

              {/* CONTACT */}
              <Link
                href="/#contact"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:text-green-300"
              >
                📞 Contact
              </Link>

              {/* DIVIDER */}
              <div className="my-2 border-t border-white/10" />

              {/* STUDENT LOGIN */}
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-xl border border-white/30 px-4 py-3 text-center font-semibold text-white transition hover:bg-white hover:text-black"
              >
                👨‍🎓 Student Login
              </Link>

              {/* DONATE */}
              <Link
                href="/donate"
                onClick={closeMenu}
                className="rounded-xl border border-green-500 px-4 py-3 text-center font-semibold text-green-300 transition hover:bg-green-600 hover:text-white"
              >
                ❤️ Donate
              </Link>

              {/* ADMISSION */}
              <Link
                href="/admission"
                onClick={closeMenu}
                className="rounded-xl bg-green-600 px-4 py-3 text-center font-bold text-white shadow-lg transition hover:bg-green-500"
              >
                📝 Admission Open
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
