export default function Courses() {
  const courses = [
    {
      title: "Hifz-ul-Quran",
      desc: "Complete Quran memorization under experienced Huffaz.",
      
    },
    {
      title: "Nazra Quran",
      desc: "Correct Quran recitation with Tajweed.",
      
    },
    {
      title: "Islamic Studies",
      desc: "Aqeedah, Fiqh, Hadith, Seerah and Islamic Manners.",
      duration: "Regular",
    },
    {
      title: "Modern Education",
      desc: "Mathematics, English, Science and Computer Education.",
      duration: "Regular",
    },
    {
      title: "Arabic Language",
      desc: "Read, write and understand Arabic language.",
      
    },
    {
      title: "Computer Classes",
      desc: "Basic Computer, Internet, MS Office and Digital Skills.",
      
    },
  ];

  return (
    <section
      id="courses"
      className="bg-white py-24 px-6 md:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <div className="text-center">

          <p className="text-green-600 font-bold uppercase tracking-widest">
            Our Courses
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">
            Courses We Offer
          </h2>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            We provide both Islamic and modern education to prepare
            students for success in this world and the Hereafter.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {courses.map((course, index) => (

            <div
              key={index}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:border-green-600 hover:shadow-2xl"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                📖
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                {course.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-8">
                {course.desc}
              </p>

              <div className="mt-6 flex items-center justify-between">

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  {course.duration}
                </span>

                <button className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 transition">
                  Details
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}