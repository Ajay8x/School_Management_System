import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Truck, MapPin, CircleDot, CreditCard, Users,
  TrendingUp, Activity, Printer, Download, RefreshCw, ChevronRight
} from 'lucide-react';

export default function TransportReport() {
  const { currentSchool } = useContext(SchoolContext) || {};
  const [report, setReport] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [reportRes, routeRes, vehicleRes] = await Promise.all([
        API.get('/transport/report'),
        API.get('/transport/routes'),
        API.get('/transport/vehicles')
      ]);
      setReport(reportRes.data);
      setRoutes(Array.isArray(routeRes.data) ? routeRes.data : []);
      setVehicles(Array.isArray(vehicleRes.data) ? vehicleRes.data : []);
    } catch (err) {
      console.error('Error loading transport report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  useSchoolRefresh(() => {
    fetchReportData();
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Transport</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-200 font-semibold">Report</span>
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Transport Analytics & Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Overview of fleet status, capacity utilization, routes, and stoppages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={fetchReportData}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Fleet Vehicles</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {report?.totalVehicles || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Active in service: <span className="font-semibold text-emerald-600">{report?.activeVehicles || 0}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Active Routes</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {report?.totalRoutes || 0}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Operational routes: <span className="font-semibold text-indigo-600">{report?.activeRoutes || 0}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Stoppages</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {report?.totalStoppages || 0}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Across {report?.totalCircles || 0} transport circles
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Bus Capacity</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {report?.totalCapacity || 0} seats
                </h3>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Occupancy: <span className="font-semibold text-purple-600">{report?.occupancyRate || 0}%</span>
            </p>
          </div>
        </div>

        {/* Route Fleet Overview Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Active Transport Routes Summary
            </h3>
            <Link
              to="/transport/route"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Route Management &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">ROUTE</th>
                  <th className="py-3 px-4">VEHICLE</th>
                  <th className="py-3 px-4">TIMING</th>
                  <th className="py-3 px-4">CAPACITY</th>
                  <th className="py-3 px-4">STOPPAGES</th>
                  <th className="py-3 px-4">INCHARGE</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {routes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No routes registered in active school.
                    </td>
                  </tr>
                ) : (
                  routes.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{r.name}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.vehicleName || '—'} <span className="text-slate-400">({r.vehicleNumber})</span></td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.startTime} – {r.endTime}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.currentOccupancy || 0}/{r.maxCapacity || 45}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.stoppages?.length || 0}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.incharge || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
