import { useContext } from 'react';
import { SchoolContext } from '../context/SchoolContext';

export default function Footer() {
  const { currentSchool } = useContext(SchoolContext);
  const brandingName = currentSchool?.appName || currentSchool?.footerText || currentSchool?.name || 'Campus Pilot';

  return (
    <footer className="mt-8 py-4 text-center text-xs font-medium text-gray-600 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 transition-all">
      {brandingName}
    </footer>
  );
}
