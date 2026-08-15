import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Trash2, Edit, Search } from 'lucide-react';

export default function GuardiansList() {
  const { user } = useContext(AuthContext);
  const [guardians, setGuardians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const routePrefix = (user?.role === 'super-admin' || user?.role === 'admin') ? '/admin' : `/${user?.role || 'admin'}`;

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    try {
      const res = await API.get('/guardians');
      setGuardians(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch guardians', error);
      setGuardians([]);
    }
  };

  const safeGuardians = Array.isArray(guardians) ? guardians : [];
  const filteredGuardians = safeGuardians.filter(g => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const name = g?.name ? String(g.name).toLowerCase() : '';
    const phone = g?.phone ? String(g.phone) : '';
    const rel = g?.relationship ? String(g.relationship).toLowerCase() : '';
    return name.includes(q) || phone.includes(q) || rel.includes(q);
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">Guardians</h1>
          <p className="text-gray-500 dark:text-slate-400 text-[15px] mt-1 transition-colors duration-300">Manage parent and guardian information.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter guardians..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[15px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50 transition-colors duration-300">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name & Rel.</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Associated Student</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700 transition-colors duration-300">
            {filteredGuardians.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">No guardians found.</td></tr>
            ) : filteredGuardians.map((guardian, idx) => {
              const guardianName = guardian?.name || 'Unnamed Guardian';
              const initial = guardianName.charAt(0).toUpperCase();

              return (
                <tr key={guardian?._id || idx} className="hover:bg-teal-50/30 dark:hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[#faedff] dark:bg-[#b5179e]/20 flex items-center justify-center text-[#b5179e] font-bold mr-4">
                        {initial}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 dark:text-white">{guardianName}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 bg-gray-100 dark:bg-slate-700 inline-block px-2 py-0.5 rounded-md">{guardian?.relationship || 'Parent'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-slate-300">{guardian?.phone || 'N/A'}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{guardian?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                    {guardian?.studentName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {guardian?.studentId && (
                      <Link to={`${routePrefix}/students/edit/${guardian.studentId}`} className="text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 mr-3 p-1.5 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md inline-block transition-colors duration-300" title="Edit Student/Guardian"><Edit className="w-4 h-4"/></Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
