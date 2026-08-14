import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import GeneralConfig from './GeneralConfig';
import AssetConfig from './AssetConfig';
import ModuleConfig from './super-admin/ModuleConfig';
import UserCredentials from './super-admin/UserCredentials';
import Roles from './Roles';
import { AuthContext } from '../context/AuthContext';
import { Sliders, Image as ImageIcon, Boxes, Key, ShieldCheck } from 'lucide-react';

export default function Settings({ initialTab = 'general' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === 'super-admin';
  
  const tabFromUrl = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Top Title Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Manage school configuration, assets, module controls, user credentials, and role permissions.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => handleTabChange('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-teal-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          General Config
        </button>

        <button
          onClick={() => handleTabChange('asset')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'asset'
              ? 'bg-teal-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Asset Config
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => handleTabChange('module')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'module'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Module Control
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => handleTabChange('credentials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'credentials'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Key className="w-4 h-4" />
            User Credentials
          </button>
        )}

        <button
          onClick={() => handleTabChange('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'roles'
              ? 'bg-teal-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Role & Access
        </button>
      </div>

      {/* Active Tab Component */}
      <div className="animate-in fade-in duration-200">
        {activeTab === 'general' && <GeneralConfig />}
        {activeTab === 'asset' && <AssetConfig />}
        {activeTab === 'module' && <ModuleConfig />}
        {activeTab === 'credentials' && <UserCredentials />}
        {activeTab === 'roles' && <Roles />}
      </div>
    </div>
  );
}
