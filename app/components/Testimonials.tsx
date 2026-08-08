export default function Testimonials() {
  const reviews = [
    {
      name: "Parent",
      review:
        "We are very happy with the Islamic environment and discipline of the madrasa. Our child has improved in both studies and character.",
    },
    {
      name: "Student",
      review:
        "The teachers are very supportive and explain every lesson with patience. I enjoy studying here every day.",
    },
    {
      name: "Guardian",
      review:
        "This madrasa provides both Deeni and Modern education in a beautiful and peaceful atmosphere.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="bg-gradient-to-b from-green-50 to-white py-24 px-6 md:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">

        <div className="text-center">

          <p className="text-green-600 font-bold uppercase tracking-[4px]">
            Testimonials
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">
            What People Say About Us
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            The trust and appreciation of parents, students and guardians inspire us to continue providing quality education.
          </p>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {reviews.map((review, index) => (

            <div
              key={index}
              className="rounded-3xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div className="text-5xl">
                ⭐⭐⭐⭐⭐
              </div>

              <p className="mt-6 text-gray-600 leading-8 italic">
                "{review.review}"
              </p>

              <div className="mt-8">

                <h3 className="text-xl font-bold text-gray-900">
                  {review.name}
                </h3>

                <p className="text-green-600">
                  Verified Review
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}