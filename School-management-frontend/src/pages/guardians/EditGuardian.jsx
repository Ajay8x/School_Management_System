import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function EditGuardian() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ 
    name: '', occupation: '', phone: '', email: '', address: '', relationship: '' 
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuardian = async () => {
      try {
        const res = await API.get(`/guardians/${id}`);
        setFormData(res.data);
      } catch (error) {
        console.error('Failed to fetch guardian', error);
      }
    };
    fetchGuardian();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/guardians/${id}`, formData);
      navigate(`/${user.role}/guardians`);
    } catch (error) {
      console.error('Failed to update guardian', error);
      alert('Error updating guardian');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to={`/${user.role}/guardians`} className="text-gray-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 mr-4 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">Edit Guardian</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[15px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Relationship to Student</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} required>
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Uncle">Uncle</option>
                <option value="Aunt">Aunt</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Phone Number</label>
              <input type="text" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Occupation</label>
              <input type="text" className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Home Address</label>
              <textarea className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300" rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end transition-colors duration-300">
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition">Update Guardian Info</button>
          </div>
        </form>
      </div>
    </div>
  );
}
