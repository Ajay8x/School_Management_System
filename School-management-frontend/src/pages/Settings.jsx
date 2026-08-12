import { useState } from 'react';
import GeneralConfig from './GeneralConfig';
import AssetConfig from './AssetConfig';
import { Sliders, Image as ImageIcon } from 'lucide-react';

export default function Settings({ initialTab = 'general' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="space-y-6">
      {/* Settings Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm flex items-center gap-2 max-w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'general'
              ? 'bg-[#0c1324] text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          General Config
        </button>

        <button
          onClick={() => setActiveTab('asset')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'asset'
              ? 'bg-[#0c1324] text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Asset Config
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'general' ? <GeneralConfig /> : <AssetConfig />}
    </div>
  );
}
