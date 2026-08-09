export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Madrasa Admin Panel
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome to the administration dashboard.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Admissions</p>
            <h2 className="mt-2 text-3xl font-bold text-green-700">0</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Enquiries</p>
            <h2 className="mt-2 text-3xl font-bold text-green-700">0</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Notices</p>
            <h2 className="mt-2 text-3xl font-bold text-green-700">0</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Teachers</p>
            <h2 className="mt-2 text-3xl font-bold text-green-700">4</h2>
          </div>
        </div>
      </div>
    </main>
  );
}
