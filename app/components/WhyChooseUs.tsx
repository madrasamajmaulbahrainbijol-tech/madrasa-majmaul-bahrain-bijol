export default function WhyChooseUs() {
  const features = [
    {
      title: "Qualified Teachers",
      desc: "Experienced Islamic scholars and modern subject experts guiding every student.",
      icon: "👨‍🏫",
    },
    {
      title: "Islamic Environment",
      desc: "A peaceful atmosphere that develops good manners, discipline and Islamic values.",
      icon: "🕌",
    },
    {
      title: "Modern Education",
      desc: "Islamic studies together with quality academic education for a bright future.",
      icon: "📚",
    },
    {
      title: "Character Building",
      desc: "Special focus on honesty, leadership, discipline and respect for everyone.",
      icon: "⭐",
    },
    {
      title: "Computer Education",
      desc: "Students learn computer skills to prepare for the modern world.",
      icon: "💻",
    },
    {
      title: "Safe Campus",
      desc: "Clean, secure and student-friendly environment for learning.",
      icon: "🛡️",
    },
  ];

  return (
    <section
      id="why-us"
      className="bg-gray-100 py-24 px-6 md:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">

        <div className="text-center">

          <p className="text-green-600 font-bold uppercase tracking-widest">
            Why Choose Us
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">
            Why Parents Trust Our Madrasa
          </h2>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            We combine Islamic education with modern learning to build
            knowledgeable, disciplined and confident students.
          </p>

        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="text-5xl">
                {item.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                {item.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-8">
                {item.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}