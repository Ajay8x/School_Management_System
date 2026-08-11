import { useState, useEffect, useContext } from 'react';
import { SchoolContext, DEFAULT_MODULES_CONFIG } from '../../context/SchoolContext';
import { AuthContext } from '../../context/AuthContext';
import {
  Sliders, ShieldCheck, Check, CheckCircle2,
  AlertCircle, Save, RotateCcw, Plus, Trash2, Edit3, Building, Phone,
  Mail, MapPin, Search, Layers
} from 'lucide-react';
const SchoolIcon = Building;

export default function ModuleConfig() {
  const { user } = useContext(AuthContext);
  const {
    schools,
    currentSchool,
    switchSchool,
    updateSchoolModules,
    createSchool,
    updateSchool,
    deleteSchool,
    loading
  } = useContext(SchoolContext);

  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [modulesState, setModulesState] = useState(DEFAULT_MODULES_CONFIG);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' or 'schools'
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // School modal state
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    code: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    status: 'active'
  });

  // Sync selected school
  useEffect(() => {
    if (currentSchool && !selectedSchoolId) {
      setSelectedSchoolId(currentSchool._id);
    }
  }, [currentSchool]);

  // Sync modules when selected school changes
  useEffect(() => {
    if (selectedSchoolId) {
      const school = schools.find(s => s._id === selectedSchoolId);
      if (school && school.modules) {
        // Deep clone & merge with defaults
        const merged = JSON.parse(JSON.stringify(DEFAULT_MODULES_CONFIG));
        Object.keys(merged).forEach(modKey => {
          if (school.modules[modKey]) {
            merged[modKey].enabled = school.modules[modKey].enabled !== false;
            if (school.modules[modKey].submodules && merged[modKey].submodules) {
              Object.keys(merged[modKey].submodules).forEach(subKey => {
                if (school.modules[modKey].submodules[subKey] !== undefined) {
                  const val = school.modules[modKey].submodules[subKey];
                  merged[modKey].submodules[subKey].enabled = typeof val === 'boolean' ? val : (val.enabled !== false);
                }
              });
            }
          }
        });
        setModulesState(merged);
      } else {
        setModulesState(JSON.parse(JSON.stringify(DEFAULT_MODULES_CONFIG)));
      }
    }
  }, [selectedSchoolId, schools]);

  const handleToggleModule = (moduleKey) => {
    setModulesState(prev => {
      const next = { ...prev };
      const currentVal = next[moduleKey]?.enabled ?? true;
      next[moduleKey] = {
        ...next[moduleKey],
        enabled: !currentVal
      };
      return { ...next };
    });
  };

  const handleToggleSubmodule = (moduleKey, subKey) => {
    setModulesState(prev => {
      const next = { ...prev };
      const targetSub = next[moduleKey]?.submodules?.[subKey];
      if (targetSub) {
        targetSub.enabled = !targetSub.enabled;
      }
      return { ...next };
    });
  };

  const handleEnableAll = () => {
    setModulesState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      Object.keys(next).forEach(modKey => {
        next[modKey].enabled = true;
        if (next[modKey].submodules) {
          Object.keys(next[modKey].submodules).forEach(subKey => {
            next[modKey].submodules[subKey].enabled = true;
          });
        }
      });
      return next;
    });
  };

  const handleDisableAll = () => {
    setModulesState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      Object.keys(next).forEach(modKey => {
        next[modKey].enabled = false;
        if (next[modKey].submodules) {
          Object.keys(next[modKey].submodules).forEach(subKey => {
            next[modKey].submodules[subKey].enabled = false;
          });
        }
      });
      return next;
    });
  };

  const handleSaveModules = async () => {
    if (!selectedSchoolId) return;
    try {
      setSaving(true);
      setSaveError('');
      setSaveSuccess(false);

      await updateSchoolModules(selectedSchoolId, modulesState);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSaveError('Failed to save module configurations.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSchoolModal = (school = null) => {
    if (school) {
      setEditingSchool(school);
      setSchoolForm({
        name: school.name || '',
        code: school.code || '',
        tagline: school.tagline || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        status: school.status || 'active'
      });
    } else {
      setEditingSchool(null);
      setSchoolForm({
        name: '',
        code: '',
        tagline: 'Excellence in Education',
        address: '',
        phone: '',
        email: '',
        status: 'active'
      });
    }
    setShowSchoolModal(true);
  };

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    if (!schoolForm.name) return;

    try {
      if (editingSchool) {
        await updateSchool(editingSchool._id, schoolForm);
      } else {
        await createSchool(schoolForm);
      }
      setShowSchoolModal(false);
    } catch (err) {
      alert('Failed to save school details');
    }
  };

  const handleDeleteSchool = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? All associated settings will be removed.`)) {
      await deleteSchool(id);
    }
  };

  const activeSchoolObj = schools.find(s => s._id === selectedSchoolId) || currentSchool;

  const filteredModules = Object.entries(modulesState).filter(([key, mod]) => {
    if (!searchTerm) return true;
    const matchTitle = mod.title?.toLowerCase().includes(searchTerm.toLowerCase()) || key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSub = mod.submodules && Object.values(mod.submodules).some(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTitle || matchSub;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1527] to-[#17233f] text-white p-6 rounded-2xl shadow-xl border border-slate-700/60">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight">Super Admin Control Panel</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Super Admin Access
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Configure system modules, enable/disable features per school, and manage school institutions.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'modules'
                ? 'bg-teal-500 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            Module Configuration
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'schools'
                ? 'bg-teal-500 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building className="w-4 h-4" />
            Manage Schools ({schools.length})
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">Module permissions updated successfully for {activeSchoolObj?.name}!</p>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{saveError}</p>
        </div>
      )}

      {activeTab === 'modules' ? (
        <>
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* School Selector */}
            <div className="flex items-center space-x-3 flex-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-2">
                <SchoolIcon className="w-4 h-4 text-teal-500" />
                Target School:
              </label>
              <div className="relative flex-1 max-w-md">
                <select
                  value={selectedSchoolId}
                  onChange={(e) => {
                    setSelectedSchoolId(e.target.value);
                    switchSchool(e.target.value);
                  }}
                  className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition"
                >
                  {schools.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.code ? `(${s.code})` : ''} {s._id === currentSchool?._id ? '★ [Active]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative w-full lg:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnableAll}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 transition"
              >
                Enable All
              </button>
              <button
                type="button"
                onClick={handleDisableAll}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100 transition"
              >
                Disable All
              </button>
              <button
                type="button"
                onClick={handleSaveModules}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20 disabled:opacity-50 transition"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Module Grid matching Screenshot 2 */}
          <div className="space-y-4">
            {filteredModules.map(([moduleKey, mod]) => {
              const isEnabled = mod.enabled !== false;
              const submodulesList = mod.submodules ? Object.entries(mod.submodules) : [];

              return (
                <div
                  key={moduleKey}
                  className={`bg-white dark:bg-slate-800/90 rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    isEnabled
                      ? 'border-gray-200 dark:border-slate-700'
                      : 'border-dashed border-gray-300 dark:border-slate-700/60 opacity-75'
                  }`}
                >
                  {/* Module Header Bar */}
                  <div className="p-4 md:px-6 bg-[#fcfdfe] dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-gray-300 dark:bg-slate-600'}`} />
                      <h3 className="font-bold text-gray-800 dark:text-white text-base">
                        {mod.title || moduleKey.toUpperCase()}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        ({submodulesList.filter(([, s]) => s.enabled !== false).length} / {submodulesList.length} sub-features enabled)
                      </span>
                    </div>

                    {/* Master Module Toggle */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                        {isEnabled ? 'Module Active' : 'Module Disabled'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleModule(moduleKey)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Sub-modules Grid */}
                  {submodulesList.length > 0 && (
                    <div className={`p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/40 dark:bg-slate-900/30 ${!isEnabled ? 'pointer-events-none opacity-40' : ''}`}>
                      {submodulesList.map(([subKey, sub]) => {
                        const isSubEnabled = sub.enabled !== false;
                        return (
                          <div
                            key={subKey}
                            onClick={() => isEnabled && handleToggleSubmodule(moduleKey, subKey)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isSubEnabled
                                ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-teal-400 shadow-sm'
                                : 'bg-gray-100/60 dark:bg-slate-800/40 border-gray-200/50 dark:border-slate-700/50 opacity-60'
                            }`}
                          >
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                              {sub.name || subKey}
                            </span>

                            {/* Submodule Toggle */}
                            <div
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                isSubEnabled ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-600'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isSubEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between z-20">
            <div className="text-sm text-gray-600 dark:text-slate-300">
              Editing permissions for: <span className="font-bold text-teal-600 dark:text-teal-400">{activeSchoolObj?.name}</span>
            </div>
            <button
              type="button"
              onClick={handleSaveModules}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/25 transition"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Module Configurations
            </button>
          </div>
        </>
      ) : (
        /* Manage Schools Section */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Registered School Branches</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Add, configure, or remove institutions from your ecosystem.</p>
            </div>
            <button
              onClick={() => handleOpenSchoolModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Add New School
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map(school => {
              const isActive = school._id === currentSchool?._id;
              return (
                <div
                  key={school._id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : 'border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                      <Check className="w-3 h-3" /> Active Now
                    </span>
                  )}

                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                        {school.code || school.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-base leading-snug">{school.name}</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-400">{school.tagline || 'Excellence in Education'}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-slate-400 mt-4 border-t border-gray-100 dark:border-slate-700/60 pt-3">
                      {school.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{school.phone}</span>
                        </div>
                      )}
                      {school.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{school.email}</span>
                        </div>
                      )}
                      {school.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{school.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        switchSchool(school);
                        setSelectedSchoolId(school._id);
                        setActiveTab('modules');
                      }}
                      className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 transition"
                    >
                      {isActive ? 'Configure Modules' : 'Switch & Configure'}
                    </button>
                    
                    <button
                      onClick={() => handleOpenSchoolModal(school)}
                      className="p-2 rounded-lg text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      title="Edit School"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    {schools.length > 1 && (
                      <button
                        onClick={() => handleDeleteSchool(school._id, school.name)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Delete School"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit School Modal */}
      {showSchoolModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {editingSchool ? 'Edit School Information' : 'Add New School Institution'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
              Enter branch details. The school will inherit default modules automatically.
            </p>

            <form onSubmit={handleSaveSchool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex International Academy"
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">School Code</label>
                  <input
                    type="text"
                    placeholder="e.g. AIA001"
                    value={schoolForm.code}
                    onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })}
                    className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                    className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@school.edu"
                  value={schoolForm.email}
                  onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                  className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Tagline / Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Empowering Global Leaders"
                  value={schoolForm.tagline}
                  onChange={(e) => setSchoolForm({ ...schoolForm, tagline: e.target.value })}
                  className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Campus Address</label>
                <textarea
                  rows={2}
                  placeholder="City, State, Zipcode"
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                  className="w-full bg-[#f8fafc] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20 transition"
                >
                  {editingSchool ? 'Update School' : 'Create School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
