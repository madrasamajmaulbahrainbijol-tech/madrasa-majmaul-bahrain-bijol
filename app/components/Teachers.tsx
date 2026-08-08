export default function Teachers() {
  const teachers = [
    {
      name: "Hafiz Mohammad Inzemamul Haque Rasheedi",
      subject: "Nazrah & Qirat",
      icon: "📖",
    },
    {
      name: "Maulana Mohammad Izhar Ashraf Alayi",
      subject: "Darse Nizami",
      icon: "🕌",
    },
    {
      name: "Hafiz-o-Qari Mohammad Wasif Raza Salami",
      subject: "Hifz-ul-Quran",
      icon: "📚",
    },
    {
      name: "Mohammad Rehan Raza",
      subject: "English, Mathematics, Basic Science & Moral Education",
      icon: "🎓",
    },
  ];

  return (
    <section
      id="teachers"
      className="bg-gradient-to-b from-white to-green-50 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mb-16 text-center">

          <p className="text-green-600 font-semibold tracking-[4px] uppercase">
            Our Faculty
          </p>

          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-gray-900">
            Meet Our Teachers
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 leading-8">
            Our experienced teachers are committed to nurturing Islamic values
            along with quality education for every student.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {teachers.map((teacher, index) => (

            <div
              key={index}
              className="rounded-3xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              {/* Image Placeholder */}

              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-5xl">
                {teacher.icon}
              </div>

              <h3 className="mt-6 text-center text-xl font-bold text-gray-900 leading-8">
                {teacher.name}
              </h3>

              <div className="mx-auto my-4 h-1 w-14 rounded-full bg-green-600"></div>

              <p className="text-center font-semibold text-green-700">
                {teacher.subject}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}