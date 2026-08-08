export default function Admission() {
  const steps = [
    {
      no: "01",
      title: "Fill Admission Form",
      desc: "Complete the admission form with the student's details.",
    },
    {
      no: "02",
      title: "Submit Documents",
      desc: "Submit Aadhaar, Birth Certificate and previous academic records.",
    },
    {
      no: "03",
      title: "Interview / Assessment",
      desc: "Student interaction and basic educational assessment.",
    },
    {
      no: "04",
      title: "Admission Confirmed",
      desc: "After verification, admission will be confirmed officially.",
    },
  ];

  return (
    <section
      id="admission"
      className="bg-gradient-to-b from-green-50 to-white py-24 px-6 md:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">

        <div className="text-center">

          <p className="text-green-600 font-bold uppercase tracking-[4px]">
            Admission
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">
            Admission Process
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            Join Madrasa Majmaul Bahrain Bijol in just four simple steps.
          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((step, index) => (

            <div
              key={index}
              className="rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition duration-300 hover:-translate-y-2"
            >

              <div className="text-5xl font-extrabold text-green-600">
                {step.no}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                {step.title}
              </h3>

              <p className="mt-4 leading-8 text-gray-600">
                {step.desc}
              </p>

            </div>

          ))}

        </div>

        <div className="mt-16 text-center">

          <button className="rounded-xl bg-green-600 px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-green-700">
            Apply For Admission
          </button>

        </div>

      </div>
    </section>
  );
}