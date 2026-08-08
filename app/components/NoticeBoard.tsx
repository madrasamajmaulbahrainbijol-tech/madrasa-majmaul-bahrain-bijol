export default function NoticeBoard() {
  const notices = [
    {
      title: "Admissions Open for 2026-27",
      date: "01 Aug 2026",
    },
    {
      title: "Monthly Parent Meeting",
      date: "10 Aug 2026",
    },
    {
      title: "Independence Day Programme",
      date: "15 Aug 2026",
    },
    {
      title: "Quarterly Examination",
      date: "25 Aug 2026",
    },
  ];

  return (
    <section
      id="notice"
      className="bg-white py-24 px-6 md:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <div className="text-center">

          <p className="text-green-600 font-bold uppercase tracking-[4px]">
            Latest Updates
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">
            Notice Board
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">

          {/* Latest Notices */}

          <div className="rounded-3xl bg-green-700 p-8 text-white shadow-xl">

            <h3 className="text-3xl font-bold">
              Latest Notices
            </h3>

            <div className="mt-8 space-y-5">

              {notices.map((notice, index) => (

                <div
                  key={index}
                  className="rounded-xl bg-white/10 p-5 backdrop-blur"
                >

                  <h4 className="font-semibold text-lg">
                    {notice.title}
                  </h4>

                  <p className="mt-2 text-green-200">
                    {notice.date}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Announcement */}

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-xl">

            <h3 className="text-3xl font-bold text-gray-900">
              Important Announcement
            </h3>

            <p className="mt-6 text-lg leading-9 text-gray-600">
              Welcome to the official website of Madrasa Majmaul Bahrain
              Bijol. All admission updates, examination schedules,
              holidays, events and important announcements will be
              published here.
            </p>

            <button className="mt-10 rounded-xl bg-green-600 px-8 py-4 text-white font-bold hover:bg-green-700 transition">
              View All Notices
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}