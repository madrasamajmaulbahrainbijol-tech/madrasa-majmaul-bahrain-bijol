import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Heading */}
        <div className="text-center">
          <p className="font-bold uppercase tracking-[4px] text-green-600">
            About Our Madrasa
          </p>

          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Madrasa Majmaul Bahrain Bijol
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>
        </div>

        {/* Main Content */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">

          {/* About Image */}
          <div className="relative h-[420px] w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="/about.jpg"
              alt="Madrasa Majmaul Bahrain Bijol"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* About Text */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900">
              Excellence in Islamic & Modern Education
            </h3>

            <p className="mt-6 text-lg leading-9 text-gray-600">
              Madrasa Majmaul Bahrain Bijol is committed to providing quality
              Islamic education along with modern academic knowledge. Our
              mission is to nurture students with strong Islamic values,
              excellent character, and the skills needed to succeed in
              today's world.
            </p>

            <p className="mt-6 text-lg leading-9 text-gray-600">
              We believe that education is not only about knowledge but also
              about discipline, morality, leadership and serving humanity
              with sincerity.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-5">

              <div className="rounded-2xl bg-green-50 p-6">
                <h4 className="text-4xl font-extrabold text-green-600">
                  60+
                </h4>
                <p className="mt-2 text-gray-700">
                  Students
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-6">
                <h4 className="text-4xl font-extrabold text-green-600">
                  4+
                </h4>
                <p className="mt-2 text-gray-700">
                  Teachers
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-6">
                <h4 className="text-4xl font-extrabold text-green-600">
                  1.5+
                </h4>
                <p className="mt-2 text-gray-700">
                  Years Experience
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-6">
                <h4 className="text-4xl font-extrabold text-green-600">
                  100%
                </h4>
                <p className="mt-2 text-gray-700">
                  Islamic Environment
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
