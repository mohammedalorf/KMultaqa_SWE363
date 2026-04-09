import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-8">
      <div className="max-w-xl rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="mb-6 text-slate-600">The route you tried does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
