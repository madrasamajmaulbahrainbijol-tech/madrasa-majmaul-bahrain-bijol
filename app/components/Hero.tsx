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
        className="object-cover object-center md:object-[center_40%]"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65" />

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-20 pt-40 sm:px-6">
        <div className="mx-auto max-w-5xl text-center text-white">

          {/* Small Heading */}
          <p className="mb-5 text-sm font-bold uppercase tracking-[4px] text-green-300 drop-shadow-lg sm:text-lg sm:tracking-[5px]">
            Islamic & Modern Education
          </p>

          {/* Main Heading */}
          <h1 className="text-4xl font-extrabold leading-tight drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
            Madrasa Majmaul
            <br />
            <span className="text-green-300">
              Bahrain Bijol
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-3xl text-base font-medium leading-7 text-gray-100 drop-shadow-lg sm:mt-8 sm:text-lg sm:leading-8 md:text-xl">
            A place dedicated to Quranic education, Islamic values,
            academic excellence, discipline and character building.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">

            {/* Admission */}
            <Link
              href="/admission"
              className="w-full max-w-xs rounded-xl bg-green-600 px-8 py-4 text-center text-lg font-bold text-white shadow-2xl transition duration-300 hover:scale-105 hover:bg-green-500 sm:w-auto"
            >
              Admission Open
            </Link>

            {/* Courses */}
            <Link
              href="/courses"
              className="w-full max-w-xs rounded-xl border-2 border-white bg-black/20 px-8 py-4 text-center text-lg font-bold text-white shadow-xl backdrop-blur-sm transition duration-300 hover:bg-white hover:text-green-700 sm:w-auto"
            >
              Explore Courses
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
