import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Plus, Save, RefreshCw, X, 
  Clock, User, FileText, ChevronRight, Download
} from 'lucide-react';

export default function GatePass() {
  const [passes, setPasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            Gate Pass System
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Authorize and track student/staff exit permissions during school hours.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl flex items-center shadow-xl shadow-amber-500/30 transition-all font-black active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Generate Pass
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-20 rounded-[40px] border border-gray-100 dark:border-slate-700 text-center">
        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-2">Under Implementation</h3>
        <p className="text-gray-400 font-bold max-w-sm mx-auto">This module will allow printing digital gate passes with QR codes for authorized exits.</p>
      </div>
    </div>
  );
}
