
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  Package, RotateCcw, FileText, DollarSign, AlertCircle, 
  Clock, Building2, Receipt, TrendingUp, ShieldCheck, Truck,
  Calendar, CheckCircle2, Activity, Wallet, CreditCard, Layers, Share2, Check
} from 'lucide-react';
import { EquipmentRecord, OwnershipType } from '../types';
import { computeRecordFields, formatCurrency } from '../utils/calculations';
import { exportToSheets } from '../utils/sheetExport';

interface DashboardProps {
  records: EquipmentRecord[];
  mode: OwnershipType | 'All';
}

const Dashboard: React.FC<DashboardProps> = ({ records, mode }) => {
  const [showToast, setShowToast] = useState(false);
  const computedData = records.map(r => ({ ...r, computed: computeRecordFields(r) }));

  const handleSync = () => {
    exportToSheets(records);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // General Stats
  const totalKits = records.length;
  const kitsInUse = records.filter(r => !r.kitReturnedDate).length;
  
  // Calibration Status Stats
  const calibStats = {
    'OK': computedData.filter(d => d.computed.reminderStatus === '✅ OK').length,
    'Soon': computedData.filter(d => d.computed.reminderStatus === '🔔 DUE SOON').length,
    'Urgent': computedData.filter(d => d.computed.reminderStatus === '⚠️ URGENT').length,
    'Expired': computedData.filter(d => d.computed.reminderStatus === '❌ EXPIRED').length,
  };

  const calibPieData = [
    { name: 'Healthy', value: calibStats.OK, color: '#10B981' },
    { name: 'Near Due', value: calibStats.Soon, color: '#F59E0B' },
    { name: 'Urgent', value: calibStats.Urgent, color: '#F97316' },
    { name: 'Expired', value: calibStats.Expired, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Distribution Data
  const companyCounts: Record<string, number> = {};
  records.forEach(r => {
    companyCounts[r.internalCompany] = (companyCounts[r.internalCompany] || 0) + 1;
  });
  const companyData = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // --- RENTAL SPECIFIC METRICS ---
  const totalPendingAmount = computedData.reduce((sum, item) => sum + item.computed.pendingAmount, 0);
  const invoicedPendingAmount = computedData
    .filter(r => r.invoiceNumber.trim() !== '' && !r.isPaymentDone)
    .reduce((sum, item) => sum + item.computed.rentalCost, 0);
  
  const vendorCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.ownershipType === 'Rental') {
      vendorCounts[r.rentalCompany] = (vendorCounts[r.rentalCompany] || 0) + 1;
    }
  });
  const vendorData = Object.entries(vendorCounts).map(([name, count]) => ({ name, count }));

  // --- OWN SPECIFIC METRICS ---
  const healthyAssets = calibStats.OK;
  const criticalAssets = calibStats.Urgent + calibStats.Expired;

  // Shared sync button component
  const SyncButton = () => (
    <button 
      onClick={handleSync}
      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
    >
      <Share2 size={14} />
      Sync to Google Sheet
    </button>
  );

  // Render Rental Dashboard
  if (mode === 'Rental') {
    return (
      <div className="space-y-8 animate-fadeIn relative">
        <div className="flex justify-end -mb-4">
          <SyncButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            icon={<Truck size={24} />} 
            label="Total Rental Kits" 
            value={totalKits} 
            color="indigo" 
            trend="External Fleet"
          />
          <KpiCard 
            icon={<Clock size={24} />} 
            label="Active Rentals" 
            value={kitsInUse} 
            color="amber" 
            trend="In-field Now"
          />
          <KpiCard 
            icon={<Receipt size={24} />} 
            label="Invoiced (Unpaid)" 
            value={formatCurrency(invoicedPendingAmount)} 
            color="orange" 
            trend="Redemption Pending"
          />
          <KpiCard 
            icon={<Wallet size={24} />} 
            label="Total Liability" 
            value={formatCurrency(totalPendingAmount)} 
            color="rose" 
            trend="Total Accrued"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-sm border border-slate-200/60 dark:border-gray-800">
            <Header label="Vendor Distribution" sub="External Partners" icon={<Building2 className="text-indigo-500" />} />
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={140} fontSize={11} fontWeight={800} stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', color: '#000' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 12, 12, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-sm border border-slate-200/60 dark:border-gray-800">
            <Header label="Cost Structure" sub="Monthly Claims" icon={<TrendingUp className="text-emerald-500" />} />
            <div className="flex flex-col h-[350px] justify-center">
                <div className="space-y-6">
                   <StatRow label="Invoiced Pending" value={formatCurrency(invoicedPendingAmount)} color="bg-orange-500" />
                   <StatRow label="Accruing (Non-Invoiced)" value={formatCurrency(totalPendingAmount - invoicedPendingAmount)} color="bg-indigo-500" />
                   <div className="pt-6 border-t dark:border-gray-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rental Exposure</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(totalPendingAmount)}</p>
                   </div>
                </div>
            </div>
          </div>
        </div>
        {showToast && <Toast message="Rental Data Copied! Paste in Sheet A1" />}
      </div>
    );
  }

  // Render Own Dashboard
  if (mode === 'Own') {
    return (
      <div className="space-y-8 animate-fadeIn relative">
        <div className="flex justify-end -mb-4">
          <SyncButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            icon={<ShieldCheck size={24} />} 
            label="Total Own Assets" 
            value={totalKits} 
            color="emerald" 
            trend="Company Inventory"
          />
          <KpiCard 
            icon={<CheckCircle2 size={24} />} 
            label="Calibration Healthy" 
            value={healthyAssets} 
            color="emerald" 
            trend="Ready for Use"
          />
          <KpiCard 
            icon={<AlertCircle size={24} />} 
            label="Urgent Maintenance" 
            value={criticalAssets} 
            color="rose" 
            trend="Action Required"
          />
          <KpiCard 
            icon={<Activity size={24} />} 
            label="In-Field Assets" 
            value={kitsInUse} 
            color="blue" 
            trend="Deployed Status"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-sm border border-slate-200/60 dark:border-gray-800">
            <Header label="Compliance Status" sub="Calibration Health" icon={<ShieldCheck className="text-emerald-500" />} />
            <div className="h-[350px] flex flex-col items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={calibPieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                      {calibPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  {calibPieData.map(item => (
                    <div key={item.name} className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase">{item.name}</span>
                      <span className="ml-auto text-sm font-black text-slate-800 dark:text-gray-200">{item.value}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-sm border border-slate-200/60 dark:border-gray-800">
            <Header label="Entity Allocation" sub="Internal Site Offices" icon={<Building2 className="text-blue-500" />} />
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={9} fontWeight={800} tickLine={false} axisLine={false} stroke="#64748b" />
                  <YAxis fontSize={10} fontWeight={800} tickLine={false} axisLine={false} stroke="#64748b" />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', color: '#000' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {showToast && <Toast message="Asset Inventory Copied! Paste in Sheet A1" />}
      </div>
    );
  }

  // Fallback / Combined Dashboard
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
       <div className="p-6 bg-slate-100 dark:bg-gray-800 rounded-full text-slate-300 dark:text-gray-600">
          <Layers size={64} />
       </div>
       <h3 className="text-2xl font-black text-slate-800 dark:text-white">Enterprise Overview</h3>
       <p className="text-slate-500 dark:text-gray-400 max-w-md">You are viewing the consolidated inventory system. Select a specific module from the sidebar for detailed specialized analytics.</p>
    </div>
  );
};

const Header: React.FC<{ label: string; sub: string; icon: React.ReactNode }> = ({ label, sub, icon }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-slate-50 dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">{icon}</div>
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{label}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub}</p>
      </div>
    </div>
  </div>
);

const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-emerald-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-slideUp z-[100] border border-slate-700 dark:border-emerald-700 backdrop-blur-md bg-opacity-90">
    <div className="bg-emerald-500 p-1.5 rounded-full text-white shadow-lg shadow-emerald-500/40">
      <Check size={18} />
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-widest">{message}</p>
      <p className="text-[10px] text-slate-400 dark:text-emerald-300 font-bold uppercase tracking-widest mt-0.5">Ready for Excel / Google Sheets</p>
    </div>
  </div>
);

const StatRow: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between group">
     <div className="flex items-center gap-3">
        <div className={`w-2 h-8 rounded-full ${color} opacity-80 group-hover:opacity-100 transition-opacity`} />
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
           <p className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{value}</p>
        </div>
     </div>
  </div>
);

const KpiCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue' | 'orange';
  trend: string;
}> = ({ icon, label, value, color, trend }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800',
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-7 rounded-[40px] shadow-sm border border-slate-200/60 dark:border-gray-800 flex flex-col gap-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-[20px] border shadow-sm ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-[0.2em]">{trend}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter truncate" title={value.toString()}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
