import { useState, useEffect, useContext } from 'react';
import { SchoolContext, DEFAULT_MODULES_CONFIG } from '../../context/SchoolContext';
import { AuthContext } from '../../context/AuthContext';
import {
  Boxes, GripVertical, CheckCircle2, AlertCircle, Save, 
  Building, Search, Plus, UserCheck, Shield
} from 'lucide-react';

export default function ModuleConfig() {
  const { user } = useContext(AuthContext);
  const {
    schools,
    currentSchool,
    switchSchool,
    updateSchoolModules,
    loading
  } = useContext(SchoolContext);

  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all', 'admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'
  const [modulesState, setModulesState] = useState(DEFAULT_MODULES_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
        const merged = JSON.parse(JSON.stringify(DEFAULT_MODULES_CONFIG));
        Object.keys(merged).forEach(modKey => {
          if (school.modules[modKey]) {
            const incoming = school.modules[modKey];
            merged[modKey].enabled = incoming.enabled !== false;
            if (incoming.roles) merged[modKey].roles = incoming.roles;

            if (incoming.submodules && merged[modKey].submodules) {
              Object.keys(merged[modKey].submodules).forEach(subKey => {
                if (incoming.submodules[subKey] !== undefined) {
                  const val = incoming.submodules[subKey];
                  if (typeof val === 'boolean') {
                    merged[modKey].submodules[subKey].enabled = val;
                  } else {
                    merged[modKey].submodules[subKey].enabled = val.enabled !== false;
                    if (val.roles) merged[modKey].submodules[subKey].roles = val.roles;
                  }
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

  // Toggle main module
  const handleToggleModule = (moduleKey) => {
    setModulesState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const targetMod = next[moduleKey];
      if (!targetMod) return prev;

      if (selectedRole === 'all') {
        const newStatus = !targetMod.enabled;
        targetMod.enabled = newStatus;
        if (targetMod.submodules) {
          Object.keys(targetMod.submodules).forEach(subKey => {
            targetMod.submodules[subKey].enabled = newStatus;
          });
        }
      } else {
        if (!targetMod.roles) targetMod.roles = {};
        const currentRoleState = targetMod.roles[selectedRole] !== false;
        targetMod.roles[selectedRole] = !currentRoleState;
      }

      return next;
    });
  };

  // Toggle submodule
  const handleToggleSubmodule = (moduleKey, subKey) => {
    setModulesState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const targetSub = next[moduleKey]?.submodules?.[subKey];
      if (!targetSub) return prev;

      if (selectedRole === 'all') {
        targetSub.enabled = !targetSub.enabled;
      } else {
        if (!targetSub.roles) targetSub.roles = {};
        const currentRoleState = targetSub.roles[selectedRole] !== false;
        targetSub.roles[selectedRole] = !currentRoleState;
      }

      return next;
    });
  };

  const handleEnableAll = () => {
    setModulesState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      Object.keys(next).forEach(modKey => {
        if (selectedRole === 'all') {
          next[modKey].enabled = true;
          if (next[modKey].submodules) {
            Object.keys(next[modKey].submodules).forEach(subKey => {
              next[modKey].submodules[subKey].enabled = true;
            });
          }
        } else {
          if (!next[modKey].roles) next[modKey].roles = {};
          next[modKey].roles[selectedRole] = true;
          if (next[modKey].submodules) {
            Object.keys(next[modKey].submodules).forEach(subKey => {
              if (!next[modKey].submodules[subKey].roles) next[modKey].submodules[subKey].roles = {};
              next[modKey].submodules[subKey].roles[selectedRole] = true;
            });
          }
        }
      });
      return next;
    });
  };

  const handleDisableAll = () => {
    setModulesState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      Object.keys(next).forEach(modKey => {
        if (selectedRole === 'all') {
          next[modKey].enabled = false;
          if (next[modKey].submodules) {
            Object.keys(next[modKey].submodules).forEach(subKey => {
              next[modKey].submodules[subKey].enabled = false;
            });
          }
        } else {
          if (!next[modKey].roles) next[modKey].roles = {};
          next[modKey].roles[selectedRole] = false;
          if (next[modKey].submodules) {
            Object.keys(next[modKey].submodules).forEach(subKey => {
              if (!next[modKey].submodules[subKey].roles) next[modKey].submodules[subKey].roles = {};
              next[modKey].submodules[subKey].roles[selectedRole] = false;
            });
          }
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

  const activeSchoolObj = schools.find(s => s._id === selectedSchoolId) || currentSchool;

  const filteredModules = Object.entries(modulesState).filter(([key, mod]) => {
    if (!searchTerm) return true;
    const matchTitle = mod.title?.toLowerCase().includes(searchTerm.toLowerCase()) || key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSub = mod.submodules && Object.values(mod.submodules).some(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTitle || matchSub;
  });

  // Check if main module is active for selected view
  const isModActive = (mod) => {
    if (selectedRole === 'all') {
      return mod.enabled !== false;
    }
    return mod.enabled !== false && mod.roles?.[selectedRole] !== false;
  };

  // Check if submodule is active for selected view
  const isSubActive = (sub) => {
    if (selectedRole === 'all') {
      return sub.enabled !== false;
    }
    return sub.enabled !== false && sub.roles?.[selectedRole] !== false;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Title matching Screenshot 2 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Module Configuration
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Configure all the modules you would like to enable in the application.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">
            Module permissions updated successfully for {activeSchoolObj?.name} {selectedRole !== 'all' ? `(${selectedRole.toUpperCase()} Role)` : ''}!
          </p>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{saveError}</p>
        </div>
      )}

      {/* Target Selector & Search Controls Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-200/80 dark:border-slate-700 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* School & Role Selector */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Target School */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
              <Building className="w-4 h-4 text-teal-500" />
              School:
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                switchSchool(e.target.value);
              }}
              className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {schools.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Target Role Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-500" />
              Configuring For Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-teal-600 dark:text-teal-400 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">All Roles (School Default)</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Guardian / Parent</option>
              <option value="accountant">Accountant</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full lg:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleEnableAll}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 transition whitespace-nowrap"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={handleDisableAll}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 transition whitespace-nowrap"
          >
            Disable All
          </button>
          <button
            type="button"
            onClick={handleSaveModules}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20 disabled:opacity-50 transition whitespace-nowrap"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Module Grid Matching Screenshots 2, 3 & 4 */}
      <div className="space-y-5">
        {filteredModules.map(([moduleKey, mod]) => {
          const mainActive = isModActive(mod);
          const submodulesList = mod.submodules ? Object.entries(mod.submodules) : [];

          return (
            <div
              key={moduleKey}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/90 dark:border-slate-700/80 shadow-sm overflow-hidden transition-all duration-200"
            >
              {/* Category Header Bar matching Screenshots 2, 3, 4 */}
              <div className="p-3.5 md:px-5 bg-white dark:bg-slate-800 flex items-center justify-between border-b border-gray-100 dark:border-slate-700/80">
                <div className="flex items-center space-x-2.5">
                  {/* Grip / Move Icon */}
                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-slate-500 cursor-move" />

                  {/* Category Title Pill Badge matching screenshot + Reception, + Academic, + Student */}
                  <div className="flex items-center space-x-1 px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-white shadow-xs">
                    <Plus className="w-3.5 h-3.5 text-gray-500" />
                    <span>{mod.title || moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1)}</span>
                  </div>
                </div>

                {/* Master Switch on the right matching screenshot */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleToggleModule(moduleKey)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      mainActive ? 'bg-slate-900 dark:bg-teal-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        mainActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sub-modules Grid matching Screenshot 2, 3, 4 */}
              {submodulesList.length > 0 && (
                <div className={`p-5 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 bg-white dark:bg-slate-800/40 ${!mainActive ? 'opacity-40 pointer-events-none' : ''}`}>
                  {submodulesList.map(([subKey, sub]) => {
                    const active = isSubActive(sub);
                    return (
                      <div key={subKey} className="flex items-center space-x-3">
                        {/* Submodule Toggle Switch on left side matching screenshots */}
                        <button
                          type="button"
                          onClick={() => handleToggleSubmodule(moduleKey, subKey)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            active ? 'bg-slate-900 dark:bg-teal-500' : 'bg-gray-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {/* Submodule Name */}
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                          {sub.name || subKey}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between z-20">
        <div className="text-sm text-gray-600 dark:text-slate-300">
          Target School: <span className="font-bold text-teal-600 dark:text-teal-400">{activeSchoolObj?.name}</span>
          {selectedRole !== 'all' && (
            <span className="ml-2 font-semibold text-gray-500">
              (Role: <span className="text-teal-500 uppercase">{selectedRole}</span>)
            </span>
          )}
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
    </div>
  );
}
