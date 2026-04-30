export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">KMultaqa SWE363</h1>
        <p className="mb-6 text-slate-600">
          Your React app is now running. Use the `/src/app/routes.jsx` file to add real pages.
        </p>
        <a
          href="/student/login"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Go to login (placeholder)
        </a>
      </div>
    </main>
  );
}
