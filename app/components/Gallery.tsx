export default function Gallery() {
  const gallery = [
    "Campus",
    "Classroom",
    "Students",
    "Library",
    "Prayer Hall",
    "Annual Program",
  ];

  return (
    <section id="gallery" className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-green-600 font-semibold tracking-[4px] uppercase">
            Our Gallery
          </p>

          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-gray-900">
            Campus Moments
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our madrasa campus, classrooms, students and educational
            environment.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {gallery.map((item, index) => (

            <div
              key={index}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition duration-300"
            >

              <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">

                <span className="text-6xl">📷</span>

              </div>

              <div className="p-6">

                <h3 className="text-xl font-bold text-gray-900">
                  {item}
                </h3>

                <p className="mt-2 text-gray-600">
                  Image will be added here later.
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}