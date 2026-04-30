import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";
export default function ErrorBoundary() {
    const error = useRouteError();
    return (<div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600"/>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          {error?.statusText || error?.message || "An unexpected error occurred"}
        </p>
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea551] transition-colors">
          <Home className="w-5 h-5 mr-2"/>
          Back to Home
        </Link>
      </div>
    </div>);
}
