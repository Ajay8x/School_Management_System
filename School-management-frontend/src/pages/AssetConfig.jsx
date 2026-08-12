import { useState, useEffect, useContext, useRef } from 'react';
import { SchoolContext } from '../context/SchoolContext';
import { AuthContext } from '../context/AuthContext';
import { 
  Upload, Image as ImageIcon, Trash2, Check, AlertCircle, Save, 
  RotateCcw, ShieldAlert, Sparkles, Eye, Link as LinkIcon, RefreshCw
} from 'lucide-react';

export default function AssetConfig() {
  const { currentSchool, updateSchool } = useContext(SchoolContext);
  const { user } = useContext(AuthContext);

  const isSuperAdmin = user?.role === 'super-admin';

  // Default fallback SVG logo matching the screenshot (Campus Tracker logo)
  const DEFAULT_CAMPUS_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 350' width='400' height='350'><circle cx='200' cy='150' r='120' fill='%23004bb3'/><rect x='140' y='110' width='25' height='80' fill='white' rx='4'/><rect x='180' y='80' width='25' height='110' fill='white' rx='4'/><rect x='220' y='130' width='25' height='60' fill='white' rx='4'/><path d='M130 170 L210 90 L260 120 L285 90 M270 90 L285 90 L285 105' stroke='white' stroke-width='14' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='200' y='310' font-family='Arial, sans-serif' font-weight='bold' font-size='38' fill='%23002b66' text-anchor='middle' letter-spacing='2'>CAMPUS</text><text x='200' y='340' font-family='Arial, sans-serif' font-weight='bold' font-size='20' fill='%23556b8e' text-anchor='middle' letter-spacing='5'>TRACKER</text></svg>";

  const DEFAULT_GUEST_BG = "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1920&q=80";
  const DEFAULT_GUEST_FULL_BG = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80";

  // Assets state matching exact screenshot specifications
  const [assets, setAssets] = useState({
    guestBackground: '',
    guestFullPageBackground: '',
    logo: '',
    logoLight: '',
    icon: '',
    iconLight: '',
    favicon: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeModalKey, setActiveModalKey] = useState(null); // Asset currently being edited in upload modal
  const [modalInputType, setModalInputType] = useState('file'); // 'file' or 'url'
  const [modalUrlInput, setModalUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Asset configurations metadata matching exact screenshot labels & dimension specs
  const ASSET_SPECS = [
    {
      key: 'guestBackground',
      title: 'Guest Background',
      dimensions: '1920×2880',
      isDarkBg: false,
      defaultImg: DEFAULT_GUEST_BG
    },
    {
      key: 'guestFullPageBackground',
      title: 'Guest Full Page Background',
      dimensions: '1920×1080',
      isDarkBg: false,
      defaultImg: DEFAULT_GUEST_FULL_BG
    },
    {
      key: 'logo',
      title: 'Logo',
      dimensions: '600×200',
      isDarkBg: false,
      defaultImg: DEFAULT_CAMPUS_LOGO
    },
    {
      key: 'logoLight',
      title: 'Logo Light',
      dimensions: '600×200',
      isDarkBg: true, // Dark container card background matching screenshot!
      defaultImg: DEFAULT_CAMPUS_LOGO
    },
    {
      key: 'icon',
      title: 'Icon',
      dimensions: '512×512',
      isDarkBg: false,
      defaultImg: DEFAULT_CAMPUS_LOGO
    },
    {
      key: 'iconLight',
      title: 'Icon Light',
      dimensions: '512×512',
      isDarkBg: true, // Dark container card background matching screenshot!
      defaultImg: DEFAULT_CAMPUS_LOGO
    },
    {
      key: 'favicon',
      title: 'Favicon',
      dimensions: '128×128',
      isDarkBg: false,
      defaultImg: DEFAULT_CAMPUS_LOGO
    }
  ];

  // Load active school assets into state
  useEffect(() => {
    if (currentSchool) {
      const schoolAssets = currentSchool.assets || {};
      setAssets({
        guestBackground: schoolAssets.guestBackground || DEFAULT_GUEST_BG,
        guestFullPageBackground: schoolAssets.guestFullPageBackground || DEFAULT_GUEST_FULL_BG,
        logo: schoolAssets.logo || currentSchool.logoUrl || DEFAULT_CAMPUS_LOGO,
        logoLight: schoolAssets.logoLight || currentSchool.logoUrl || DEFAULT_CAMPUS_LOGO,
        icon: schoolAssets.icon || DEFAULT_CAMPUS_LOGO,
        iconLight: schoolAssets.iconLight || DEFAULT_CAMPUS_LOGO,
        favicon: schoolAssets.favicon || DEFAULT_CAMPUS_LOGO
      });
    }
  }, [currentSchool]);

  // Handle local file select and convert to Data URL
  const handleFileChange = (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, SVG, WebP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      setAssets(prev => ({ ...prev, [key]: result }));
      setActiveModalKey(null);
      setMessage({ type: 'success', text: `Updated ${key} preview.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Handle direct URL submit
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (activeModalKey && modalUrlInput) {
      setAssets(prev => ({ ...prev, [activeModalKey]: modalUrlInput }));
      setActiveModalKey(null);
      setModalUrlInput('');
      setMessage({ type: 'success', text: 'Asset URL updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Reset to default assets
  const handleReset = () => {
    setAssets({
      guestBackground: DEFAULT_GUEST_BG,
      guestFullPageBackground: DEFAULT_GUEST_FULL_BG,
      logo: DEFAULT_CAMPUS_LOGO,
      logoLight: DEFAULT_CAMPUS_LOGO,
      icon: DEFAULT_CAMPUS_LOGO,
      iconLight: DEFAULT_CAMPUS_LOGO,
      favicon: DEFAULT_CAMPUS_LOGO
    });
    setMessage({ type: 'info', text: 'Assets reset to default configuration.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Save assets to school profile
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Permission denied: Only Super Admin can modify school assets.' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const updatedPayload = {
        ...currentSchool,
        logoUrl: assets.logo || assets.logoLight,
        assets: assets
      };

      await updateSchool(currentSchool._id, updatedPayload);

      // Update favicon dynamically if updated
      if (assets.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = assets.favicon;
      }

      setMessage({ type: 'success', text: 'Asset configuration saved successfully! Logos & icons updated live.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Error saving assets:', err);
      setMessage({ type: 'error', text: 'Failed to save asset configuration.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-bold text-gray-800 dark:text-white tracking-tight">Asset Config</h1>
            {isSuperAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                Super Admin Mode
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Upload asset images to customize logos, icons, favicons and backgrounds for your school.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isSuperAdmin || saving}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Assets
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isSuperAdmin || saving}
            className="px-6 py-2.5 bg-[#0c1324] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Assets
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
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

      {/* Asset Upload Main Container matching exact Screenshot 2 Layout */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/70 dark:border-slate-700/80 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Asset Upload</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">Upload asset images.</p>
        </div>

        {/* 3 Columns Grid matching exact Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ASSET_SPECS.map((spec) => {
            const currentImg = assets[spec.key] || spec.defaultImg;

            return (
              <div key={spec.key} className="flex flex-col space-y-2">
                {/* Header label with spec size */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    {spec.title}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
                    {spec.dimensions}
                  </span>
                </div>

                {/* Card Image Display Box matching Screenshot 2 (Light / Dark variants) */}
                <div className={`relative h-48 rounded-xl border border-gray-200/80 dark:border-slate-700 overflow-hidden flex items-center justify-center transition-all group ${
                  spec.isDarkBg ? 'bg-[#0f172a]' : 'bg-white dark:bg-slate-900'
                }`}>
                  {/* Image Preview */}
                  {currentImg ? (
                    <img
                      src={currentImg}
                      alt={spec.title}
                      className="max-h-36 max-w-[85%] object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center text-gray-400 dark:text-slate-500 p-4">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs font-medium">No asset uploaded</span>
                    </div>
                  )}

                  {/* Overlay upload action buttons on hover */}
                  {isSuperAdmin && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalKey(spec.key);
                          setModalInputType('file');
                        }}
                        className="px-3 py-1.5 bg-white text-gray-800 hover:bg-gray-100 rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-600" />
                        Upload
                      </button>

                      {currentImg && (
                        <button
                          type="button"
                          onClick={() => setAssets(prev => ({ ...prev, [spec.key]: '' }))}
                          className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal for Super Admin */}
      {activeModalKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-base">
                  Upload {ASSET_SPECS.find(s => s.key === activeModalKey)?.title}
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                  Recommended size: {ASSET_SPECS.find(s => s.key === activeModalKey)?.dimensions}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalKey(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Input Mode Selector */}
            <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setModalInputType('file')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  modalInputType === 'file'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400'
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => setModalInputType('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  modalInputType === 'url'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400'
                }`}
              >
                Image URL
              </button>
            </div>

            {modalInputType === 'file' ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-8 text-center cursor-pointer transition bg-gray-50/50 dark:bg-slate-900/50"
              >
                <Upload className="w-10 h-10 mx-auto text-teal-500 mb-2 opacity-80" />
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Click to select image</p>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Supports PNG, JPG, SVG, WebP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, activeModalKey)}
                  className="hidden"
                />
              </div>
            ) : (
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Direct Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/logo.png"
                    value={modalUrlInput}
                    onChange={(e) => setModalUrlInput(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalKey(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition"
                  >
                    Apply URL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
