export default function Facilities() {
  const facilities = [
    {
      icon: "🕌",
      title: "Beautiful Masjid",
      desc: "A peaceful environment for daily prayers and Islamic learning.",
    },
    {
      icon: "📚",
      title: "Modern Library",
      desc: "Collection of Islamic and academic books for every student.",
    },
    {
      icon: "💻",
      title: "Computer Lab",
      desc: "Basic computer education with practical learning facilities.",
    },
    {
      icon: "🏠",
      title: "Hostel Facility",
      desc: "Safe, clean and comfortable accommodation for students.",
    },
    {
      icon: "⚽",
      title: "Playground",
      desc: "Sports and physical activities for healthy development.",
    },
    {
      icon: "🚌",
      title: "Transport",
      desc: "Transport facility for students from nearby areas.",
    },
    {
      icon: "🍽️",
      title: "Healthy Food",
      desc: "Nutritious and hygienic meals prepared with care.",
    },
    {
      icon: "🛡️",
      title: "Safe Campus",
      desc: "Secure, disciplined and CCTV monitored environment.",
    },
  ];

  return (
    <section
      id="facilities"
      className="bg-white py-24 px-6 md:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <div className="text-center">

          <p className="text-green-600 font-bold uppercase tracking-[4px]">
            Our Facilities
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">
            World Class Facilities
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            We provide a peaceful Islamic environment with modern
            educational facilities for every student.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {facilities.map((item, index) => (

            <div
              key={index}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:border-green-600 hover:shadow-2xl"
            >

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-5xl">
                {item.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                {item.title}
              </h3>

              <p className="mt-4 leading-8 text-gray-600">
                {item.desc}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}