const fs = require('fs');
const path = require('path');

const pages = [
  'Classes',
  'Examinations',
  'Fees',
  'Attendance',
  'Leaves',
  'Certificate',
  'Library',
  'Accounts',
  'HRM',
  'NoticeBoard',
  'Event',
  'Message',
  'Roles',
  'Settings'
];

const frontendPath = path.join(__dirname, 'School-management-frontend', 'src', 'pages');

pages.forEach(page => {
  const componentCode = `export default function ${page}() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight">${page.replace(/([A-Z])/g, ' $1').trim()} Module</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[15px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 text-center text-gray-500 dark:text-slate-400">
        <p className="text-lg">This module is currently under construction.</p>
        <p className="mt-2 text-sm">The backend endpoints and basic UI layout are successfully scaffolded.</p>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(frontendPath, `${page}.jsx`), componentCode);
});

console.log("Frontend scaffolding complete.");
