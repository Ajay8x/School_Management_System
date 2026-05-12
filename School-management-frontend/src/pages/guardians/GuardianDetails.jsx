import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export default function GuardianDetails() {
  const { user } = useContext(AuthContext);
  const [guardian, setGuardian] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchGuardian = async () => {
      try {
        const res = await API.get(`/guardians/${id}`);
        setGuardian(res.data);
      } catch (error) {
        console.error('Failed to fetch guardian', error);
      }
    };
    fetchGuardian();
  }, [id]);

  if (!guardian) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to={`/${user.role}/guardians`} className="text-gray-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 mr-4 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">Guardian Profile</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[15px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="h-32 bg-gradient-to-r from-teal-400 to-emerald-500 dark:from-teal-600 dark:to-emerald-700 transition-colors duration-300"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg transition-colors duration-300">
              <div className="w-full h-full bg-[#faedff] dark:bg-[#b5179e]/20 rounded-xl flex items-center justify-center text-[40px] text-[#b5179e] font-bold transition-colors duration-300">
                {guardian.name.charAt(0)}
              </div>
            </div>
            <Link 
              to={`/${user.role}/guardians/edit/${guardian._id}`}
              className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition shadow-sm font-medium"
            >
              Edit Profile
            </Link>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{guardian.name}</h2>
            <p className="text-teal-600 dark:text-teal-400 font-medium mt-1 transition-colors duration-300">{guardian.relationship}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 transition-colors duration-300">Contact Information</h3>
              
              <div className="flex items-start">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg text-teal-600 dark:text-teal-400 mr-4 transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors duration-300">Phone Number</p>
                  <p className="font-medium text-gray-800 dark:text-slate-200 transition-colors duration-300">{guardian.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg text-teal-600 dark:text-teal-400 mr-4 transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors duration-300">Email Address</p>
                  <p className="font-medium text-gray-800 dark:text-slate-200 transition-colors duration-300">{guardian.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg text-teal-600 dark:text-teal-400 mr-4 transition-colors duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors duration-300">Home Address</p>
                  <p className="font-medium text-gray-800 dark:text-slate-200 transition-colors duration-300">{guardian.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 transition-colors duration-300">Professional Details</h3>
              
              <div className="flex items-start">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 mr-4 transition-colors duration-300">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors duration-300">Occupation</p>
                  <p className="font-medium text-gray-800 dark:text-slate-200 transition-colors duration-300">{guardian.occupation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
