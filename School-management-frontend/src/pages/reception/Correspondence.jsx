import { Mail } from 'lucide-react';

export default function Correspondence() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-500" />
            Correspondence
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Track dispatched and received mail, documents, and parcels.</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-20 rounded-[40px] border border-gray-100 dark:border-slate-700 text-center">
        <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-2">Mail Registry</h3>
        <p className="text-gray-400 font-bold max-w-sm mx-auto">Full correspondence tracking features will be available in the next update.</p>
      </div>
    </div>
  );
}
