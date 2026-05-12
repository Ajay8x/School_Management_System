import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  School,
  User,
  Lock,
  Hash,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const ROLES = [
  {
    id: 'user',
    label: 'Official Login',
    icon: ShieldCheck,
    color: 'from-violet-600 to-indigo-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-400',
    ring: 'ring-violet-400',
    iconColor: 'text-violet-600',
    desc: 'For Admins, Teachers & Staff',
  },
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-400',
    ring: 'ring-teal-400',
    iconColor: 'text-teal-600',
    desc: 'Student portal login',
  },
];

export default function Login() {
  const [activeRole, setActiveRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, studentLogin, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const currentRole = ROLES.find((r) => r.id === activeRole);

  const handleRoleSwitch = (roleId) => {
    setActiveRole(roleId);
    setError('');
    setEmail('');
    setPassword('');
    setRollNumber('');
    setIsRegistering(false);
    setName('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userData;
      if (activeRole === 'student') {
        userData = await studentLogin(rollNumber, password);
      } else if (isRegistering) {
        // Default to 'admin' role when registering from the 'Official' tab
        const roleToRegister = activeRole === 'user' ? 'admin' : activeRole;
        userData = await register(name, email, password, roleToRegister);
      } else {
        userData = await login(email, password);
      }
      navigate(`/${userData.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full pl-11 pr-4 py-3.5 bg-white/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 transition-all duration-200 text-sm backdrop-blur-sm';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f0c29]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-4">
            <School className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">CampusPilot</h1>
          <p className="text-white/50 text-sm mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> School Management System
          </p>
        </div>

        {/* Glass card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Role Tab Bar */}
          <div className="flex border-b border-white/10">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSwitch(role.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3.5 text-xs font-semibold transition-all duration-300 relative
                    ${isActive ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span>{role.label}</span>
                  {isActive && (
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${currentRole.color} rounded-full`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Form area */}
          <div className="p-7">
            {/* Role description */}
            <div className={`mb-6 px-4 py-3 rounded-xl border ${currentRole.border}/30 ${currentRole.bg} flex items-center gap-3`}>
              {(() => {
                const Icon = currentRole.icon;
                return <Icon className={`w-5 h-5 ${currentRole.iconColor} flex-shrink-0`} />;
              })()}
              <div>
                <p className={`text-xs font-bold ${currentRole.iconColor}`}>{currentRole.label} Login</p>
                <p className="text-xs text-gray-500 dark:text-white/40">{currentRole.desc}</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (register mode only) */}
              {isRegistering && activeRole === 'user' && (
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                  <input
                    type="text"
                    className={`${inputBase} focus:ring-violet-400/50 focus:border-violet-400/50`}
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Roll Number field (student only) */}
              {activeRole === 'student' ? (
                <div className="relative group">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="text"
                    className={`${inputBase} focus:ring-teal-400/50 focus:border-teal-400/50`}
                    placeholder="Roll Number (e.g. 10A12)"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              ) : (
                /* Email field (non-student) */
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                  <input
                    type="email"
                    className={`${inputBase} focus:ring-violet-400/50 focus:border-violet-400/50`}
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              )}

              {/* Password field */}
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputBase} pr-11 ${
                    activeRole === 'student'
                      ? 'focus:ring-teal-400/50 focus:border-teal-400/50'
                      : 'focus:ring-violet-400/50 focus:border-violet-400/50'
                  }`}
                  placeholder={activeRole === 'student' ? 'Password (default: Roll Number)' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Student hint */}
              {activeRole === 'student' && (
                <p className="text-xs text-white/30 text-center">
                  💡 First-time login? Use your <strong className="text-white/50">Roll Number</strong> as password.
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg
                  bg-gradient-to-r ${currentRole.color}
                  hover:opacity-90 active:scale-[0.98] transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                  mt-2`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    {isRegistering ? 'Create Account' : `Sign In as ${currentRole.label}`}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Official Register toggle */}
            {activeRole === 'user' && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                  className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
                >
                  {isRegistering
                    ? '← Back to sign in'
                    : 'Need an official account? Register here'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} CampusPilot — Secure School Management
        </p>
      </div>
    </div>
  );
}
