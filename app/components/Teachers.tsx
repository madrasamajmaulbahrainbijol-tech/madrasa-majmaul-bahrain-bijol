import Image from "next/image";

export default function Teachers() {
  const teachers = [
    {
      name: "Hafiz Mohammad Inzemamul Haque Rasheedi",
      subject: "Nazrah & Qirat",
      image: "/teacher-inzemamul.jpg",
    },
    {
      name: "Maulana Mohammad Izhar Ashraf Alayi",
      subject: "Darse Nizami",
      image: "/teacher-izhar.jpg",
    },
    {
      name: "Hafiz-o-Qari Mohammad Wasif Raza Salami",
      subject: "Hifz-ul-Quran",
      image: "/teacher-wasif.jpg",
    },
    {
      name: "Mohammad Rehan Raza",
      subject:
        "English, Mathematics, Basic Science & Moral Education",
      image: "/teacher-rehan.jpg",
    },
  ];

  return (
    <section
      id="teachers"
      className="bg-gradient-to-b from-white via-gray-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Section Heading */}
        <div className="mb-16 text-center">

          <p className="font-semibold uppercase tracking-[4px] text-green-600">
            Our Faculty
          </p>

          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Meet Our Teachers
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Our experienced teachers are committed to nurturing Islamic
            values along with quality education for every student.
          </p>

        </div>

        {/* Teacher Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {teachers.map((teacher, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-green-200 hover:shadow-2xl"
            >

              {/* Image Area */}
              <div className="relative h-72 w-full overflow-hidden rounded-[22px] bg-gray-100">

                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                />

              </div>

              {/* Teacher Information */}
              <div className="px-2 pb-3 pt-6">

                <h3 className="text-center text-xl font-bold leading-8 text-gray-900">
                  {teacher.name}
                </h3>

                {/* Divider */}
                <div className="mx-auto my-4 h-1 w-14 rounded-full bg-green-600"></div>

                <p className="text-center text-sm font-semibold leading-7 text-green-700">
                  {teacher.subject}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
