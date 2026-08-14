import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Bug, ArrowLeft, ShieldAlert, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL: Uncaught Error in React Application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      setTimeout(this.handleReset, 100);
    } else {
      window.location.href = '/';
    }
  };

  handleClearCacheAndReset = () => {
    if (window.confirm('Clear cached session data and restart app?')) {
      localStorage.removeItem('active_school');
      localStorage.removeItem('active_school_id');
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected runtime exception occurred.';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 sm:p-6 font-sans relative overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Top Icon Badge */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-500/20 rounded-2xl blur-md animate-pulse"></div>
              <div className="relative w-full h-full bg-slate-800 border-2 border-rose-500/60 rounded-2xl flex items-center justify-center text-rose-400 shadow-lg">
                <AlertTriangle className="w-10 h-10 stroke-[2]" />
              </div>
            </div>

            {/* Error Title */}
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full mb-3">
              Application Error Protected
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              An unhandled exception occurred in the interface. Don't worry, your data is safe and the app prevented a complete crash.
            </p>

            {/* Error Box Summary */}
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 mb-6 text-left shadow-inner">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Bug className="w-4 h-4" /> Error Description
              </div>
              <p className="font-mono text-xs sm:text-sm text-rose-200 break-words font-semibold">
                {errorMessage}
              </p>

              {/* Toggle Stack Trace Details */}
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="mt-3 text-[11px] text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 transition"
              >
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {this.state.showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 pt-3 border-t border-slate-800 font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap break-all leading-tight">
                  <p className="text-rose-300 font-bold mb-1">Stack Trace:</p>
                  {this.state.error?.stack || 'No stack trace available'}
                  {componentStack && (
                    <>
                      <p className="text-teal-300 font-bold mt-2 mb-1">Component Trace:</p>
                      {componentStack}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoBack}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-bold rounded-xl border border-slate-600 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>

              <a
                href="/admin/dashboard"
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-bold rounded-xl border border-slate-600 transition flex items-center gap-2"
              >
                <Home className="w-4 h-4" /> Dashboard
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-center">
              <button
                type="button"
                onClick={this.handleClearCacheAndReset}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear active school cache & reset app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
