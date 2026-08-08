import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero.jpg"
        alt="Madrasa Majmaul Bahrain Bijol"
        fill
        priority
        className="object-cover object-center md:object-[center_40%]"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-black/55"></div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="mt-28 md:mt-36 max-w-5xl text-center text-white">
          {/* Tagline */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-green-300 tracking-wide drop-shadow-lg">
            
          </h2>

          {/* Description */}
          <p className="mx-auto mt-10 max-w-3xl text-base sm:text-lg md:text-xl leading-8 text-gray-200">
            
            <br />
            
            <br />
            
          </p>

          {/* Buttons */}
          {/* Buttons */}
<div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">

  <Link
    href="/admission"
    className="rounded-xl bg-green-600 px-10 py-4 text-lg font-bold shadow-2xl transition duration-300 hover:scale-105 hover:bg-green-500"
  >
    Admission Open
  </Link>

  <Link
    href="/courses"
    className="rounded-xl border-2 border-white px-10 py-4 text-lg font-bold transition duration-300 hover:bg-white hover:text-black"
  >
    Explore Courses
  </Link>

</div>
          {/* Scroll Icon */}
          <div className="mt-14 animate-bounce text-3xl text-white">
            ↓
          </div>
        </div>
      </div>
    </section>
  );
}