import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/90 shadow-lg backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
        <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">

          {/* LOGO */}
          <Link
            href="/"
            className="shrink-0 text-center leading-tight lg:text-left"
          >
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              Madrasa
            </h1>

            <p className="text-sm font-semibold text-green-300 sm:text-base lg:text-xl">
              Majmaul Bahrain Bijol
            </p>
          </Link>

          {/* ALL NAVIGATION BUTTONS */}
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-end">

            {/* HOME */}
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base"
            >
              Home
            </Link>

            {/* ABOUT */}
            <Link
              href="/#about"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base"
            >
              About
            </Link>

            {/* COURSES */}
            <Link
              href="/courses"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base"
            >
              Courses
            </Link>

            {/* TEACHERS */}
            <Link
              href="/#teachers"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base"
            >
              Teachers
            </Link>

            {/* GALLERY */}
            <Link
              href="/#gallery"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base"
            >
              Gallery
            </Link>

            {/* CONTACT */}
            <Link
              href="/#contact"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base"
            >
              Contact
            </Link>

            {/* STUDENT LOGIN */}
            <Link
              href="/login"
              className="rounded-xl border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black sm:px-4 sm:text-base"
            >
              Student Login
            </Link>

            {/* DONATE */}
            <Link
              href="/donate"
              className="rounded-xl border border-green-500 px-3 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-600 hover:text-white sm:px-4 sm:text-base"
            >
              Donate
            </Link>

            {/* PUBLIC ADMISSION FORM — NEVER LINK THIS TO THE ADMIN ADMISSIONS PANEL */}
            <Link
              href="/admission"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-green-500 sm:px-5 sm:text-base"
            >
              Admission Open
            </Link>

          </nav>
        </div>
      </div>
    </header>
  );
}
