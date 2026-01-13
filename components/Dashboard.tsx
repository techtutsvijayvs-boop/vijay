
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Package, Truck, RotateCcw, FileText, DollarSign, AlertCircle, 
  Clock, CheckCircle2, Building2
} from 'lucide-react';
import { EquipmentRecord, ComputedFields } from '../types';
import { computeRecordFields, formatCurrency } from '../utils/calculations';

interface DashboardProps {
  records: EquipmentRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const computedData = records.map(r => ({ ...r, computed: computeRecordFields(r) }));

  // KPI Logic
  const totalKits = records.length;
  const kitsInUse = records.filter(r => !r.kitReturnedDate).length;
  const returnedKits = records.filter(r => !!r.kitReturnedDate).length;
  const pendingClaims = records.filter(r => r.invoiceNumber.trim() === '').length;
  const totalPendingAmount = computedData.reduce((sum, item) => sum + item.computed.pendingAmount, 0);

  // Calibration Status Stats
  const calibStats = {
    'OK': computedData.filter(d => d.computed.reminderStatus === '✅ OK').length,
    'Soon': computedData.filter(d => d.computed.reminderStatus === '🔔 DUE SOON').length,
    'Urgent': computedData.filter(d => d.computed.reminderStatus === '⚠️ URGENT').length,
    'Expired': computedData.filter(d => d.computed.reminderStatus === '❌ EXPIRED').length,
  };

  const calibPieData = [
    { name: 'OK', value: calibStats.OK, color: '#10B981' },
    { name: 'Due Soon', value: calibStats.Soon, color: '#F59E0B' },
    { name: 'Urgent', value: calibStats.Urgent, color: '#F97316' },
    { name: 'Expired', value: calibStats.Expired, color: '#EF4444' },
  ];

  // Company Distribution
  const companyCounts: Record<string, number> = {};
  records.forEach(r => {
    companyCounts[r.internalCompany] = (companyCounts[r.internalCompany] || 0) + 1;
  });
  const companyData = Object.entries(companyCounts).map(([name, count]) => ({ name, count }));

  // Active Kits (Filtered Live Table)
  const activeKits = computedData.filter(d => !d.kitReturnedDate).slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={<Package className="text-blue-500" />} label="Total Kits" value={totalKits} />
        <KpiCard icon={<Clock className="text-yellow-500" />} label="Kits In Use" value={kitsInUse} />
        <KpiCard icon={<RotateCcw className="text-green-500" />} label="Returned Kits" value={returnedKits} />
        <KpiCard icon={<FileText className="text-purple-500" />} label="Pending Claims" value={pendingClaims} />
        <KpiCard icon={<DollarSign className="text-red-500" />} label="Pending Amount" value={formatCurrency(totalPendingAmount)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="text-blue-500" size={20} />
            Kits per Internal Company
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calibration Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-500" size={20} />
            Calibration Status
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calibPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {calibPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-800 leading-tight mt-1">{value}</p>
    </div>
  </div>
);

export default Dashboard;
