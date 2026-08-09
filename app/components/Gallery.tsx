import Image from "next/image";

export default function Gallery() {
  const gallery = [
    {
      title: "Campus",
      image: "/campus.jpg",
    },
    {
      title: "Classroom",
      image: "/classroom.jpg",
    },
    {
      title: "Students",
      image: "/students.jpg",
    },
    {
      title: "Library",
      image: "/library.jpg",
    },
    {
      title: "Prayer Hall",
      image: "/prayer-hall.jpg",
    },
    {
      title: "Annual Program",
      image: "/annual-program.jpg",
    },
  ];

  return (
    <section id="gallery" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Heading */}
        <div className="mb-16 text-center">
          <p className="font-semibold uppercase tracking-[4px] text-green-600">
            Our Gallery
          </p>

          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Campus Moments
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Explore our madrasa campus, classrooms, students and educational
            environment.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {gallery.map((item, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-[30px] border border-gray-200 bg-white transition duration-300 hover:-translate-y-1"
            >

              {/* Image */}
              <div className="relative h-72 w-full overflow-hidden rounded-[26px] bg-gray-100">

                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

              </div>

              {/* Details */}
              <div className="p-6">

                <h3 className="text-xl font-bold text-gray-900">
                  {item.title}
                </h3>

                <div className="mt-3 h-1 w-12 rounded-full bg-green-600"></div>

                <p className="mt-3 text-gray-600">
                  A glimpse of Madrasa Majmaul Bahrain Bijol.
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
