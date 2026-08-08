import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="w-full border-b border-white/10 bg-black/45 backdrop-blur-xl shadow-2xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">

          {/* Logo */}

          <Link href="/" className="leading-tight">

            <h1 className="text-4xl font-extrabold text-white">
              Madrasa
            </h1>

            <p className="text-xl font-semibold text-green-300">
              Majmaul Bahrain Bijol
            </p>

          </Link>

          {/* Desktop Menu */}

          <nav className="hidden items-center gap-8 xl:gap-10 lg:flex">

            <Link
              href="/"
              className="font-semibold text-white transition duration-300 hover:text-green-300"
            >
              Home
            </Link>

            <a
              href="/#about"
              className="font-semibold text-white transition duration-300 hover:text-green-300"
            >
              About
            </a>

            <Link
              href="/courses"
              className="font-semibold text-white transition duration-300 hover:text-green-300"
            >
              Courses
            </Link>

            <a
              href="/#teachers"
              className="font-semibold text-white transition duration-300 hover:text-green-300"
            >
              Teachers
            </a>

            <a
              href="/#gallery"
              className="font-semibold text-white transition duration-300 hover:text-green-300"
            >
              Gallery
            </a>

            <a
              href="/#contact"
              className="font-semibold text-white transition duration-300 hover:text-green-300"
            >
              Contact
            </a>

          </nav>

          {/* Right Buttons */}

          <div className="hidden items-center gap-3 lg:flex">

            <Link
              href="/login"
              className="rounded-xl border border-white/30 px-5 py-2 font-semibold text-white transition duration-300 hover:bg-white hover:text-black"
            >
              Student Login
            </Link>

            <Link
              href="/donate"
              className="rounded-xl border border-green-500 px-5 py-2 font-semibold text-green-300 transition duration-300 hover:bg-green-600 hover:text-white"
            >
              Donate
            </Link>

            <Link
              href="/admission"
              className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-xl transition duration-300 hover:bg-green-500"
            >
              Admission Open
            </Link>

          </div>

          {/* Mobile Button */}

          <button className="text-3xl text-white lg:hidden">
            ☰
          </button>

        </div>

      </div>
    </header>
  );
}