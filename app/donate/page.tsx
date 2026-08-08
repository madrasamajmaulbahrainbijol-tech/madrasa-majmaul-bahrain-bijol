import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function DonatePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}

      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-r from-green-900 via-green-700 to-green-600 px-6 pt-28 pb-20">

        <div className="max-w-5xl text-center text-white">

          <p className="mb-4 text-lg font-semibold uppercase tracking-[5px] text-green-200">
            Support Our Mission
          </p>

          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">

            Donate For Education

            <br />

            & Sadaqah-e-Jariyah

          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-green-100">

            Your contribution helps us provide quality Islamic
            and modern education, support deserving students,
            and develop our madrasa for future generations.

          </p>

          <div className="mt-10 flex flex-col justify-center gap-5 sm:flex-row">

            <a
              href="#donate"
              className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-green-700 transition hover:scale-105"
            >
              Donate Now
            </a>

            <Link
              href="/contact"
              className="rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-green-700"
            >
              Contact Office
            </Link>

          </div>

        </div>

      </section>

      {/* Why Donate */}

      <section className="bg-white py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="font-semibold uppercase tracking-[4px] text-green-600">
              Donation
            </p>

            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
              Why Your Donation Matters
            </h2>

            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600"></div>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">

              Every donation supports students, teachers,
              educational resources and the development
              of Madrasa Majmaul Bahrain Bijol.

            </p>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg">

              <div className="text-5xl">🎓</div>

              <h3 className="mt-6 text-2xl font-bold text-green-700">
                Student Support
              </h3>

              <p className="mt-4 leading-8 text-gray-700">
                Help deserving students receive education,
                books and essential facilities.
              </p>

            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg">

              <div className="text-5xl">🕌</div>

              <h3 className="mt-6 text-2xl font-bold text-green-700">
                Madrasa Development
              </h3>

              <p className="mt-4 leading-8 text-gray-700">
                Contribute towards classrooms,
                library and infrastructure development.
              </p>

            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg">

              <div className="text-5xl">🤲</div>

              <h3 className="mt-6 text-2xl font-bold text-green-700">
                Sadaqah-e-Jariyah
              </h3>

              <p className="mt-4 leading-8 text-gray-700">
                Earn continuous rewards by supporting
                Islamic education for generations.
              </p>

            </div>

          </div>          {/* Islamic Inspiration */}

          <div className="mt-24 grid gap-10 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-10 shadow-xl">

              <h2 className="mb-8 text-3xl font-extrabold text-gray-900">
                Quran & Hadith
              </h2>

              <div className="space-y-8">

                <div>

                  <h3 className="text-xl font-bold text-green-700">
                    Quran 2:261
                  </h3>

                  <p className="mt-3 leading-8 text-gray-700 italic">
                    "The example of those who spend their wealth in the way of
                    Allah is like a seed that grows seven ears; in every ear are
                    one hundred grains."
                  </p>

                </div>

                <div>

                  <h3 className="text-xl font-bold text-green-700">
                    Sahih Muslim
                  </h3>

                  <p className="mt-3 leading-8 text-gray-700 italic">
                    "When a person dies, all his deeds end except three:
                    Sadaqah Jariyah, beneficial knowledge, or a righteous child
                    who prays for him."
                  </p>

                </div>

              </div>

            </div>

            {/* Donation Details */}

            <div
              id="donate"
              className="rounded-3xl bg-green-50 p-10 shadow-xl"
            >

              <h2 className="mb-8 text-3xl font-extrabold text-gray-900">
                Donation Details
              </h2>

              <div className="space-y-6 text-lg">

                <div>

                  <p className="font-semibold text-gray-700">
                    UPI ID
                  </p>

                  <p className="text-green-700 font-bold">
                    Coming Soon
                  </p>

                </div>

                <div>

                  <p className="font-semibold text-gray-700">
                    Bank Account
                  </p>

                  <p className="text-gray-700">
                    Details will be updated soon.
                  </p>

                </div>

                <div>

                  <p className="font-semibold text-gray-700">
                    Account Holder
                  </p>

                  <p className="text-gray-700">
                    Madrasa Majmaul Bahrain Bijol
                  </p>

                </div>

              </div>

              <div className="mt-10 rounded-2xl border-2 border-dashed border-green-400 bg-white p-8 text-center">

                <div className="text-7xl">📱</div>

                <h3 className="mt-5 text-2xl font-bold text-green-700">
                  QR Code
                </h3>

                <p className="mt-3 text-gray-600">
                  Donation QR Code will be added here later.
                </p>

              </div>

            </div>

          </div>          {/* Thank You Section */}

          <div className="mt-24 rounded-3xl bg-gradient-to-r from-green-700 via-green-800 to-green-900 px-8 py-16 text-center text-white shadow-2xl">

            <h2 className="text-4xl font-extrabold md:text-5xl">
              Be a Part of This Noble Mission
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-green-100">
              Your generosity helps educate students, strengthen Islamic values,
              and build a better future for our community. Every contribution,
              whether small or large, is valuable and appreciated.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">

              <Link
                href="/admission"
                className="rounded-xl bg-white px-10 py-4 text-lg font-bold text-green-700 transition duration-300 hover:scale-105"
              >
                Apply for Admission
              </Link>

              <a
                href="/#contact"
                className="rounded-xl border-2 border-white px-10 py-4 text-lg font-bold text-white transition duration-300 hover:bg-white hover:text-green-700"
              >
                Contact Office
              </a>

            </div>

          </div>

        </div>

      </section>

      <Footer />

    </>
  );
}