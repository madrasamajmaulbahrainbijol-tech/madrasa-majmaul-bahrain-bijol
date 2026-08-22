import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/90 shadow-lg backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
        <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center justify-center gap-3 leading-tight lg:justify-start">
            <img src="/mmbb-logo.svg" alt="Madrasa Majmaul Bahrain Bijol official logo" className="h-12 w-12 rounded-full bg-white object-contain p-0.5 shadow-md sm:h-14 sm:w-14" />
            <span className="text-left">
              <span className="block text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">Madrasa</span>
              <span className="block text-xs font-semibold text-green-300 sm:text-sm lg:text-base">Majmaul Bahrain Bijol</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-end">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base">Home</Link>
            <Link href="/#about" className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base">About</Link>
            <Link href="/courses" className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base">Courses</Link>
            <Link href="/#teachers" className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base">Teachers</Link>
            <Link href="/#gallery" className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base">Gallery</Link>
            <Link href="/#contact" className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-green-300 sm:px-4 sm:text-base">Contact</Link>
            <Link href="/login" className="rounded-xl border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black sm:px-4 sm:text-base">Student Login</Link>
            <Link href="/donate" className="rounded-xl border border-green-500 px-3 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-600 hover:text-white sm:px-4 sm:text-base">Donate</Link>
            <Link href="/admission" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-green-500 sm:px-5 sm:text-base">Admission Open</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
