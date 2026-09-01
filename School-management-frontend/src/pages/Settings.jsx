import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import GeneralConfig from './GeneralConfig';
import AssetConfig from './AssetConfig';
import ModuleConfig from './super-admin/ModuleConfig';
import UserCredentials from './super-admin/UserCredentials';
import Roles from './Roles';
import ActivityLog from './ActivityLog';
import LoginSessionManagement from './LoginSessionManagement';
import Placeholder from '../components/Placeholder';
import { AuthContext } from '../context/AuthContext';
import { 
  Sliders, Image as ImageIcon, Boxes, Key, ShieldCheck, Activity,
  Settings as SettingsIcon, LogIn, Bell, Mail, MessageSquare, FileText,
  List, MessageCircle, Share2, Languages, Globe
} from 'lucide-react';

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

  const tabsList = [
    { id: 'general', label: 'General Config', icon: Sliders },
    { id: 'roles', label: 'Role & Permission', icon: ShieldCheck },
    { id: 'asset', label: 'Asset Config', icon: ImageIcon },
    { id: 'system', label: 'System Config', icon: SettingsIcon },
    { id: 'auth', label: 'Authentication', icon: LogIn },
    { id: 'notification', label: 'Notification', icon: Bell },
    { id: 'mail', label: 'Mail Config', icon: Mail },
    { id: 'sms', label: 'SMS Config', icon: MessageSquare },
    { id: 'whatsapp', label: 'WhatsApp Config', icon: MessageSquare },
    { id: 'mail-template', label: 'Mail Template', icon: FileText },
    { id: 'sms-template', label: 'SMS Template', icon: FileText },
    { id: 'whatsapp-template', label: 'WhatsApp Template', icon: FileText },
    { id: 'push-template', label: 'Push Notification Template', icon: FileText },
    { id: 'feature', label: 'Feature', icon: List },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'module', label: 'Module', icon: Boxes, superAdminOnly: true },
    { id: 'social', label: 'Social Network', icon: Share2 },
    { id: 'terminology', label: 'Terminology', icon: Languages },
    { id: 'locale', label: 'Locale', icon: Globe },
    { id: 'credentials', label: 'User Credentials', icon: Key, superAdminOnly: true },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'login-session', label: 'Login Session Management', icon: LogIn }
  ];

  const visibleTabs = tabsList.filter(t => !t.superAdminOnly || isSuperAdmin);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">System Configuration & Settings</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Configure system parameters, templates, integrations, authentication rules, and active modules.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'general' && ['general', 'role', 'permission', 'view-access'].includes(activeTab)) || (tab.id === 'roles' && ['roles', 'role', 'permission', 'view-access'].includes(activeTab));
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="animate-in fade-in duration-200">
        {(activeTab === 'general' || activeTab === 'roles' || activeTab === 'role' || activeTab === 'permission' || activeTab === 'view-access') && <GeneralConfig />}
        {activeTab === 'asset' && <AssetConfig />}
        {activeTab === 'module' && <ModuleConfig />}
        {activeTab === 'credentials' && <UserCredentials />}
        {activeTab === 'activity' && <ActivityLog />}
        
        {/* Placeholder Views for New Config Subitems */}
        {activeTab === 'system' && <Placeholder title="System Config" />}
        {activeTab === 'auth' && <Placeholder title="Authentication & Security" />}
        {activeTab === 'notification' && <Placeholder title="Notification Settings" />}
        {activeTab === 'mail' && <Placeholder title="Mail Server (SMTP) Config" />}
        {activeTab === 'sms' && <Placeholder title="SMS Gateway Config" />}
        {activeTab === 'whatsapp' && <Placeholder title="WhatsApp API Config" />}
        {activeTab === 'mail-template' && <Placeholder title="Mail Template" />}
        {activeTab === 'sms-template' && <Placeholder title="SMS Template" />}
        {activeTab === 'whatsapp-template' && <Placeholder title="WhatsApp Template" />}
        {activeTab === 'push-template' && <Placeholder title="Push Notification Template" />}
        {activeTab === 'feature' && <Placeholder title="Feature Toggles" />}
        {activeTab === 'chat' && <Placeholder title="Chat & Support Settings" />}
        {activeTab === 'social' && <Placeholder title="Social Network Integration" />}
        {activeTab === 'terminology' && <Placeholder title="Custom Terminology" />}
        {activeTab === 'locale' && <Placeholder title="Locale & Language Settings" />}
        {activeTab === 'login-session' && <LoginSessionManagement />}
      </div>
    </div>
  );
}
