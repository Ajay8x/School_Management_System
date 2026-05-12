export default function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title} Module</h2>
      <p className="text-gray-500 max-w-md text-center">
        This module is currently under development. The full features for {title} will be available in a future update.
      </p>
    </div>
  );
}
