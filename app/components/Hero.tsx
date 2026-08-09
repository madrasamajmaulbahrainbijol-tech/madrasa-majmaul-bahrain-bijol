import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero.jpg"
        alt="Madrasa Majmaul Bahrain Bijol"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Image Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Buttons Only */}
      <div className="relative z-10 flex min-h-screen items-end justify-center px-4 pb-20 sm:pb-24">
        <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 sm:flex-row">

          {/* Admission Button */}
          <Link
            href="/admission"
            className="w-full max-w-xs rounded-xl bg-green-600 px-8 py-4 text-center text-lg font-bold text-white shadow-2xl transition duration-300 hover:scale-105 hover:bg-green-500 sm:w-auto"
          >
            Admission Open
          </Link>

          {/* Courses Button */}
          <Link
            href="/courses"
            className="w-full max-w-xs rounded-xl border-2 border-white bg-black/20 px-8 py-4 text-center text-lg font-bold text-white shadow-2xl backdrop-blur-sm transition duration-300 hover:bg-white hover:text-green-700 sm:w-auto"
          >
            Explore Courses
          </Link>

        </div>
      </div>
    </section>
  );
}
