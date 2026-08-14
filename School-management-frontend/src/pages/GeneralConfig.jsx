import { useState, useEffect, useContext } from 'react';
import { SchoolContext } from '../context/SchoolContext';
import { AuthContext } from '../context/AuthContext';
import { Building, Check, RotateCcw, Save, ShieldAlert, Plus, Globe, Sparkles, AlertCircle, Hash } from 'lucide-react';

export default function GeneralConfig() {
  const { currentSchool, schools, updateSchool, createSchool, switchSchool } = useContext(SchoolContext);
  const { user } = useContext(AuthContext);

  const isSuperAdmin = user?.role === 'super-admin';

  // Form State
  const [formData, setFormData] = useState({
    appName: '',
    name: '',
    code: '',
    description: '',
    metaAuthor: '',
    metaDescription: '',
    metaKeywords: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    email: '',
    phone: '',
    fax: '',
    website: '',
    financialYearCode: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({
    appName: '',
    name: '',
    code: '',
    website: '',
    email: '',
    phone: '',
    city: '',
    country: 'India'
  });
  const [onboarding, setOnboarding] = useState(false);

  // Populate form with active school configuration
  useEffect(() => {
    if (currentSchool) {
      setFormData({
        appName: currentSchool.appName || currentSchool.name || 'Campus Tracker',
        name: currentSchool.name || 'Campus Tracker School',
        code: currentSchool.code || '',
        description: currentSchool.description || 'Innovative Partner',
        metaAuthor: currentSchool.metaAuthor || currentSchool.appName || 'CampusTracker',
        metaDescription: currentSchool.metaDescription || `Application by ${currentSchool.appName || 'campustracker'}`,
        metaKeywords: currentSchool.metaKeywords || (currentSchool.appName || 'campustracker').toLowerCase().replace(/\s+/g, ''),
        addressLine1: currentSchool.addressLine1 || currentSchool.address || 'Campus Tracker Campus',
        addressLine2: currentSchool.addressLine2 || '',
        city: currentSchool.city || '',
        state: currentSchool.state || '',
        zipcode: currentSchool.zipcode || '',
        country: currentSchool.country || 'India',
        email: currentSchool.email || '',
        phone: currentSchool.phone || '',
        fax: currentSchool.fax || '',
        website: currentSchool.website || '',
        financialYearCode: currentSchool.financialYearCode || '2025-2026'
      });
    }
  }, [currentSchool]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (currentSchool) {
      setFormData({
        appName: currentSchool.appName || currentSchool.name || 'Campus Tracker',
        name: currentSchool.name || 'Campus Tracker School',
        code: currentSchool.code || '',
        description: currentSchool.description || 'Innovative Partner',
        metaAuthor: currentSchool.metaAuthor || '',
        metaDescription: currentSchool.metaDescription || '',
        metaKeywords: currentSchool.metaKeywords || '',
        addressLine1: currentSchool.addressLine1 || currentSchool.address || '',
        addressLine2: currentSchool.addressLine2 || '',
        city: currentSchool.city || '',
        state: currentSchool.state || '',
        zipcode: currentSchool.zipcode || '',
        country: currentSchool.country || '',
        email: currentSchool.email || '',
        phone: currentSchool.phone || '',
        fax: currentSchool.fax || '',
        website: currentSchool.website || '',
        financialYearCode: currentSchool.financialYearCode || ''
      });
      setMessage({ type: 'info', text: 'Form has been reset to current school settings.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Permission denied: Only Super Admin can change General Configuration.' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const updatedPayload = {
        ...currentSchool,
        name: formData.name || formData.appName,
        appName: formData.appName,
        code: formData.code,
        description: formData.description,
        metaAuthor: formData.metaAuthor,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        country: formData.country,
        address: `${formData.addressLine1} ${formData.addressLine2}`.trim(),
        email: formData.email,
        phone: formData.phone,
        fax: formData.fax,
        website: formData.website,
        financialYearCode: formData.financialYearCode
      };

      await updateSchool(currentSchool._id, updatedPayload);

      // Update page document title immediately
      document.title = `${formData.name} (${formData.code || 'CODE'}) | ${formData.appName}`;

      setMessage({ type: 'success', text: 'General Configuration saved successfully! School name and code updated across system.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setMessage({ type: 'error', text: 'Failed to save configuration. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOnboardSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolData.appName && !newSchoolData.name) return;

    try {
      setOnboarding(true);
      const created = await createSchool({
        ...newSchoolData,
        name: newSchoolData.name || newSchoolData.appName,
        appName: newSchoolData.appName,
        code: newSchoolData.code || (newSchoolData.name || newSchoolData.appName).split(' ').map(w => w[0]).join('').toUpperCase()
      });

      setShowOnboardModal(false);
      setNewSchoolData({
        appName: '',
        name: '',
        code: '',
        website: '',
        email: '',
        phone: '',
        city: '',
        country: 'India'
      });

      if (created) {
        switchSchool(created);
        setMessage({ type: 'success', text: `New school "${created.name}" onboarded and set active successfully!` });
      }
    } catch (err) {
      console.error('Onboard error:', err);
      setMessage({ type: 'error', text: 'Failed to onboard school. Please try again.' });
    } finally {
      setOnboarding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200/70 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">General Configuration</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-full">
              System Wide
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Configure active school identity, name, unique code, contact parameters, and meta fields.
          </p>
        </div>

        {/* Super Admin Actions */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={currentSchool?._id || ''}
                onChange={(e) => {
                  const selected = schools.find(s => s._id === e.target.value);
                  if (selected) switchSchool(selected);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-teal-500"
              >
                {schools.map(school => (
                  <option key={school._id} value={school._id}>
                    {school.name || school.appName} {school.code ? `(${school.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowOnboardModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Onboard New School
            </button>
          </div>
        )}
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : message.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            : 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Main Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/70 dark:border-slate-700/80 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Section 1: School Identity & Code */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2">
            <Building className="w-4 h-4" /> School Identity & Code
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">School Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="e.g. Demo International School"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">School Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="e.g. DIS001"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50 uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">App / System Title</label>
              <input
                type="text"
                name="appName"
                value={formData.appName}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Campus Tracker"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Description / Tagline</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Innovative Partner"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Financial Year Code</label>
              <input
                type="text"
                name="financialYearCode"
                value={formData.financialYearCode}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="2025-2026"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2">
            <Globe className="w-4 h-4" /> Contact & Address Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Campus Address Line 1"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Campus Address Line 2"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="City"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="State"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Zipcode</label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Pincode"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="India"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Official Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="email@school.com"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="https://school.edu"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Action Buttons */}
        {isSuperAdmin && (
          <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}
      </form>

      {/* Onboard New School Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">Onboard New School</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Configure site name and public details for new school</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSchool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">School Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Academy"
                  value={newSchoolData.name}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, name: e.target.value, appName: newSchoolData.appName || e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">School Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AGA001"
                    value={newSchoolData.code}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">App / System Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Campus Tracker"
                    value={newSchoolData.appName}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, appName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://apexschool.edu"
                    value={newSchoolData.website}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, website: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newSchoolData.phone}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="admin@apexschool.edu"
                    value={newSchoolData.email}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    value={newSchoolData.city}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {onboarding ? 'Onboarding...' : 'Save & Onboard School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
