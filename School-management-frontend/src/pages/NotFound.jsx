import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center animate-in fade-in duration-200">
        <div className="w-20 h-20 bg-teal-500/20 text-teal-400 border border-teal-500/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <h1 className="text-6xl font-black text-white tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-3">Page Not Found</h2>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          The page or route you are looking for does not exist, has been moved, or you may not have authorization to view it.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold rounded-xl border border-slate-600 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link
            to="/admin/dashboard"
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
