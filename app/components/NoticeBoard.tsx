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
    <section id="notices" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Heading */}
        <div className="text-center">
          <p className="font-bold uppercase tracking-[4px] text-green-600">
            Latest Updates
          </p>

          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Notice Board
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
            Stay updated with the latest admissions, meetings, examinations,
            programmes and important announcements.
          </p>
        </div>

        {/* Notice Content */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">

          {/* Latest Notices */}
          <div className="overflow-hidden rounded-[30px] bg-green-700 p-6 text-white md:p-8">

            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-extrabold md:text-3xl">
                Latest Notices
              </h3>

              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                2026-27
              </span>
            </div>

            <div className="mt-8 space-y-4">

              {notices.map((notice, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition duration-300 hover:bg-white/15"
                >
                  <div className="flex items-start gap-4">

                    {/* Number */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-green-700">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-base font-bold leading-7 md:text-lg">
                        {notice.title}
                      </h4>

                      <p className="mt-1 text-sm font-medium text-green-200">
                        {notice.date}
                      </p>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Important Announcement */}
          <div className="rounded-[30px] border border-gray-200 bg-gray-50 p-6 md:p-8">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              📢
            </div>

            <h3 className="mt-6 text-2xl font-extrabold text-gray-900 md:text-3xl">
              Important Announcement
            </h3>

            <div className="mt-4 h-1 w-14 rounded-full bg-green-600"></div>

            <p className="mt-6 text-base leading-8 text-gray-600 md:text-lg">
              Welcome to the official website of Madrasa Majmaul Bahrain
              Bijol. All admission updates, examination schedules, holidays,
              events and important announcements will be published here.
            </p>

            <div className="mt-8 rounded-2xl border border-green-100 bg-white p-5">
              <p className="font-semibold leading-7 text-gray-800">
                Please check this section regularly for the latest updates
                from the madrasa administration.
              </p>
            </div>

            <button
              type="button"
              className="mt-8 rounded-xl bg-green-600 px-7 py-3.5 font-bold text-white transition duration-300 hover:bg-green-700"
            >
              View All Notices
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}
