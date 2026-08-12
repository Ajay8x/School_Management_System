import { useState, useEffect, useContext } from 'react';
import { SchoolContext } from '../context/SchoolContext';
import { AuthContext } from '../context/AuthContext';
import { Building, Check, RotateCcw, Save, ShieldAlert, Plus, Globe, Sparkles, AlertCircle } from 'lucide-react';

export default function GeneralConfig() {
  const { currentSchool, schools, updateSchool, createSchool, switchSchool } = useContext(SchoolContext);
  const { user } = useContext(AuthContext);

  const isSuperAdmin = user?.role === 'super-admin';

  // Form State
  const [formData, setFormData] = useState({
    appName: '',
    name: '',
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
        name: currentSchool.name || 'Campus Tracker Campus',
        description: currentSchool.description || 'Innovative Partner',
        metaAuthor: currentSchool.metaAuthor || currentSchool.appName || 'CampusTracker',
        metaDescription: currentSchool.metaDescription || `Application by ${currentSchool.appName || 'campustracker'}`,
        metaKeywords: currentSchool.metaKeywords || (currentSchool.appName || 'campustracker').toLowerCase().replace(/\s+/g, ''),
        addressLine1: currentSchool.addressLine1 || currentSchool.address || 'Campus Tracker Campus',
        addressLine2: currentSchool.addressLine2 || 'Near BLW',
        city: currentSchool.city || 'Varanasi',
        state: currentSchool.state || 'Uttar Pradesh',
        zipcode: currentSchool.zipcode || '221005',
        country: currentSchool.country || 'India',
        email: currentSchool.email || 'help.chbs@gmail.com',
        phone: currentSchool.phone || '+919935332556',
        fax: currentSchool.fax || 'Fax',
        website: currentSchool.website || 'https://campustracker.in',
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
        name: currentSchool.name || 'Campus Tracker Campus',
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
      document.title = `${formData.appName} | ${formData.name}`;

      setMessage({ type: 'success', text: 'General Configuration saved successfully! Site name updated across app.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setMessage({ type: 'error', text: 'Failed to save configuration. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Onboard New School handler
  const handleOnboardSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolData.appName && !newSchoolData.name) {
      setMessage({ type: 'error', text: 'Please enter School/Site Name.' });
      return;
    }

    try {
      setOnboarding(true);
      const created = await createSchool({
        name: newSchoolData.name || newSchoolData.appName,
        appName: newSchoolData.appName || newSchoolData.name,
        description: 'Innovative Partner',
        website: newSchoolData.website,
        email: newSchoolData.email,
        phone: newSchoolData.phone,
        city: newSchoolData.city,
        country: newSchoolData.country,
        status: 'active'
      });

      setShowOnboardModal(false);
      setNewSchoolData({
        appName: '',
        name: '',
        website: '',
        email: '',
        phone: '',
        city: '',
        country: 'India'
      });

      if (created) {
        switchSchool(created);
        setMessage({ type: 'success', text: `School "${created.appName || created.name}" onboarded and selected!` });
      }
    } catch (err) {
      console.error('Failed to onboard school:', err);
      setMessage({ type: 'error', text: 'Failed to onboard new school.' });
    } finally {
      setOnboarding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white tracking-tight">General Configuration</h1>
            {isSuperAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                Super Admin Authorized
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Read Only View
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            This information will be displayed publicly so be careful what you share.
          </p>
        </div>

        {/* Super Admin School Switcher & Onboard Button */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/60 p-1.5 rounded-xl border border-gray-200 dark:border-slate-600">
              <Building className="w-4 h-4 text-teal-500 ml-2" />
              <select
                value={currentSchool?._id || ''}
                onChange={(e) => switchSchool(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-700 dark:text-slate-200 outline-none pr-3 cursor-pointer"
              >
                {schools.map((s) => (
                  <option key={s._id} value={s._id} className="dark:bg-slate-800">
                    {s.appName || s.name} ({s.code || 'SCH'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowOnboardModal(true)}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
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

      {/* Main Configuration Form matching exact Screenshot Layout */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/70 dark:border-slate-700/80 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Section 1: General App & Meta Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">App Name</label>
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

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Description</label>
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
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Meta Author</label>
            <input
              type="text"
              name="metaAuthor"
              value={formData.metaAuthor}
              onChange={handleChange}
              disabled={!isSuperAdmin}
              placeholder="CampusTracker"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Meta Description</label>
            <input
              type="text"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              disabled={!isSuperAdmin}
              placeholder="Application by campustracker"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Meta Keywords</label>
            <input
              type="text"
              name="metaKeywords"
              value={formData.metaKeywords}
              onChange={handleChange}
              disabled={!isSuperAdmin}
              placeholder="campustracker"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
            />
          </div>
        </div>

        {/* Section 2: Address Section */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Address</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">This address will be displayed publicly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Campus Tracker Campus"
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
                placeholder="Near BLW"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Varanasi"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
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
                placeholder="Uttar Pradesh"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
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
                placeholder="221005"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
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
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Details Section */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Contact Details</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">This contact details will be displayed publicly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="help.chbs@gmail.com"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="+919935332556"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Fax</label>
              <input
                type="text"
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                placeholder="Fax"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Website</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              disabled={!isSuperAdmin}
              placeholder="https://campustracker.in"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
            />
          </div>
        </div>

        {/* Section 4: Financial Year */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Financial Year</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">Used to identify the financial year of the organization.</p>
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
              className="w-full md:w-1/2 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-slate-800/50"
            />
          </div>
        </div>

        {/* Action Buttons matching Screenshot */}
        <div className="pt-6 border-t border-gray-100 dark:border-slate-700/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isSuperAdmin || saving}
            className="px-5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isSuperAdmin || saving}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isSuperAdmin || saving}
              className="px-7 py-2.5 bg-[#0c1324] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Onboard New School Modal (Super Admin Feature) */}
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Site / App Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Academy"
                  value={newSchoolData.appName}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, appName: e.target.value, name: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">School Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Academy Campus"
                  value={newSchoolData.name}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, name: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                />
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
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {onboarding ? 'Onboarding...' : 'Onboard & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
