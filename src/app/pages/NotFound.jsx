import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-2xl bg-[var(--card)] shadow-[var(--shadow-md)] border border-[var(--border)] p-10 text-center">
        <div className="w-14 h-14 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
          404
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2 tracking-tight">Page not found</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-7 leading-relaxed">
          The route you tried does not exist. Check the URL or head back home.
        </p>
        <Link to="/">
          <Button className="px-8">Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}
