import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}

      <section className="relative flex min-h-[60vh] items-center justify-center bg-gradient-to-r from-green-900 via-green-700 to-green-600 px-6 pt-28 pb-20">

        <div className="max-w-5xl text-center text-white">

          <p className="mb-4 text-lg font-semibold uppercase tracking-[5px] text-green-200">
            Student Portal
          </p>

          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">

            Student Login

          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-green-100">

            Login to access your student dashboard,
            attendance, academic progress and future online services.

          </p>

        </div>

      </section>

      {/* Login */}

      <section className="bg-gray-50 py-24">

        <div className="mx-auto max-w-6xl px-6">

          <div className="grid gap-10 lg:grid-cols-2">

            {/* Left Side */}

            <div>

              <p className="font-semibold uppercase tracking-[4px] text-green-600">
                Student Portal
              </p>

              <h2 className="mt-4 text-4xl font-extrabold text-gray-900">
                Welcome Back
              </h2>

              <div className="mt-5 h-1 w-24 rounded-full bg-green-600"></div>

              <p className="mt-8 text-lg leading-8 text-gray-700">

                Students can login here to access future
                online facilities including attendance,
                exam results, notices and academic records.

              </p>

              <div className="mt-10 rounded-3xl bg-green-100 p-8">

                <h3 className="text-2xl font-bold text-green-700">

                  Coming Soon

                </h3>

                <p className="mt-4 leading-8 text-gray-700">

                  This portal will soon be connected with
                  our secure student database.

                </p>

              </div>

            </div>

            {/* Login Form */}

            <div className="rounded-3xl bg-white p-10 shadow-2xl">

              <h3 className="mb-8 text-center text-3xl font-bold text-gray-900">

                Student Login

              </h3>

              <form className="space-y-6">

                <div>

                  <label className="mb-2 block font-semibold">
                    Student ID / Roll Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter Student ID"
                    className="w-full rounded-xl border border-gray-300 px-5 py-4 outline-none focus:border-green-600"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-semibold">
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="w-full rounded-xl border border-gray-300 px-5 py-4 outline-none focus:border-green-600"
                  />

                </div>                <div className="flex items-center justify-between">

                  <label className="flex items-center gap-2 text-gray-700">

                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-600"
                    />

                    Remember Me

                  </label>

                  <a
                    href="#"
                    className="font-semibold text-green-700 hover:underline"
                  >
                    Forgot Password?
                  </a>

                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-green-700 py-4 text-lg font-bold text-white transition duration-300 hover:bg-green-800"
                >
                  Login
                </button>

              </form>

              <p className="mt-8 text-center text-gray-600">
                Need help? Contact the Madrasa Office for your
                Student ID or Password.
              </p>

            </div>

          </div>

          {/* Student Notice */}

          <div className="mt-20 rounded-3xl bg-gradient-to-r from-green-700 via-green-800 to-green-900 p-10 text-center text-white shadow-2xl">

            <h2 className="text-4xl font-extrabold">
              Student Portal Under Development
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-green-100">
              Online attendance, examination results, notices,
              fee information and student profile management
              will be available in future updates.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-5 sm:flex-row">

              <Link
                href="/admission"
                className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-green-700 transition hover:scale-105"
              >
                Apply for Admission
              </Link>

              <Link
                href="/courses"
                className="rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-green-700"
              >
                View Courses
              </Link>

            </div>

          </div>

        </div>

      </section>

      <Footer />

    </>
  );
}