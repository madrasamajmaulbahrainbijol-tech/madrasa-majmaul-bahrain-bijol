export default function About() {
  return (
    <section
      id="about"
      className="bg-white py-20 px-6 md:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center">

          <p className="text-green-600 font-bold uppercase tracking-widest">
            About Our Madrasa
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">
            Madrasa Majmaul Bahrain Bijol
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

        </div>

        {/* Content */}
        <div className="mt-16 grid lg:grid-cols-2 gap-14 items-center">

          {/* Image Placeholder */}
          <div className="h-[420px] rounded-3xl bg-gray-200 flex items-center justify-center shadow-xl">

            <p className="text-2xl font-bold text-gray-500">
              About Image
            </p>

          </div>

          {/* Text */}
          <div>

            <h3 className="text-3xl font-bold text-gray-900">
              Excellence in Islamic & Modern Education
            </h3>

            <p className="mt-6 text-lg leading-9 text-gray-700">
              Madrasa Majmaul Bahrain Bijol is committed to providing
              quality Islamic education along with modern academic
              knowledge. Our mission is to nurture students with
              strong Islamic values, excellent character, and the
              skills needed to succeed in today's world.
            </p>

            <p className="mt-6 text-lg leading-9 text-gray-700">
              We believe that education is not only about knowledge
              but also about discipline, morality, leadership and
              serving humanity with sincerity.
            </p>

            {/* Stats */}

            <div className="mt-10 grid grid-cols-2 gap-6">

              <div className="rounded-2xl bg-green-50 p-6 shadow">

                <h4 className="text-4xl font-bold text-green-700">
                  500+
                </h4>

                <p className="mt-2 text-gray-700">
                  Students
                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-6 shadow">

                <h4 className="text-4xl font-bold text-green-700">
                  25+
                </h4>

                <p className="mt-2 text-gray-700">
                  Teachers
                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-6 shadow">

                <h4 className="text-4xl font-bold text-green-700">
                  15+
                </h4>

                <p className="mt-2 text-gray-700">
                  Years Experience
                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-6 shadow">

                <h4 className="text-4xl font-bold text-green-700">
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