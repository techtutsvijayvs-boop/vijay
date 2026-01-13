
import React from 'react';
import { EquipmentRecord, CalibrationStatus, ApprovalStatus } from '../types';
import { computeRecordFields, formatCurrency } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface SummaryProps {
  records: EquipmentRecord[];
}

const STATUS_MAP: Record<ApprovalStatus, { label: string; color: string }> = {
  'A': { label: 'Approved', color: '#10B981' },
  'AWC': { label: 'Appr. w/ Comments', color: '#3B82F6' },
  'RE': { label: 'Review', color: '#F59E0B' },
  'C': { label: 'Cancelled', color: '#6B7280' },
  'R': { label: 'Rejected', color: '#EF4444' },
  'N/A': { label: 'Not Submitted', color: '#E5E7EB' }
};

export const InvoiceSummary: React.FC<SummaryProps> = ({ records }) => {
  const months: string[] = Array.from(new Set<string>(records.map(r => r.claimMonth))).sort();
  
  const summaryData = months.map(month => {
    const monthRecords = records.filter(r => r.claimMonth === month);
    const computed = monthRecords.map(r => computeRecordFields(r));
    return {
      month,
      totalCost: computed.reduce((sum, item) => sum + item.rentalCost, 0),
      pendingAmount: computed.reduce((sum, item) => sum + item.pendingAmount, 0),
      paidAmount: computed.reduce((sum, item) => sum + (item.rentalCost - item.pendingAmount), 0),
    };
  });

  // Approval status distribution
  const approvalCounts: Record<string, number> = {};
  records.forEach(r => {
    const status = r.approvalStatus || 'N/A';
    approvalCounts[status] = (approvalCounts[status] || 0) + 1;
  });
  const approvalPieData = Object.entries(approvalCounts).map(([code, value]) => ({
    name: STATUS_MAP[code as ApprovalStatus]?.label || code,
    value,
    color: STATUS_MAP[code as ApprovalStatus]?.color || '#CBD5E1'
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Monthly Redemption Totals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-y border-gray-100">
                <tr>
                  <th className="py-3 px-4">Claim Month</th>
                  <th className="py-3 px-4 text-right">Total Rental</th>
                  <th className="py-3 px-4 text-right text-green-600">Total Paid</th>
                  <th className="py-3 px-4 text-right text-orange-600">Pending Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map(row => (
                  <tr key={row.month} className="border-b border-gray-50">
                    <td className="py-3 px-4 font-medium">{row.month}</td>
                    <td className="py-3 px-4 font-mono text-right">{formatCurrency(row.totalCost)}</td>
                    <td className="py-3 px-4 font-mono text-right text-green-600 font-bold">{formatCurrency(row.paidAmount)}</td>
                    <td className="py-3 px-4 text-orange-600 font-bold font-mono text-right">{formatCurrency(row.pendingAmount)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.pendingAmount === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.pendingAmount === 0 ? 'CLEARED' : 'UNPAID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Approval Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={approvalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {approvalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">Financial Progress (Paid vs Unpaid)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="paidAmount" fill="#10B981" name="Paid Total" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pendingAmount" fill="#F97316" name="Pending Payment" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const CalibrationSummary: React.FC<SummaryProps> = ({ records }) => {
  const computed = records.map(r => computeRecordFields(r));
  
  const stats = [
    { status: '✅ OK', count: computed.filter(c => c.reminderStatus === '✅ OK').length, color: 'text-green-600', bg: 'bg-green-50' },
    { status: '🔔 DUE SOON', count: computed.filter(c => c.reminderStatus === '🔔 DUE SOON').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { status: '⚠️ URGENT', count: computed.filter(c => c.reminderStatus === '⚠️ URGENT').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { status: '❌ EXPIRED', count: computed.filter(c => c.reminderStatus === '❌ EXPIRED').length, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.status} className={`${stat.bg} p-6 rounded-xl border border-white shadow-sm flex flex-col items-center justify-center`}>
            <span className="text-2xl font-bold mb-1">{stat.count}</span>
            <span className={`text-xs font-bold uppercase tracking-widest ${stat.color}`}>{stat.status}</span>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">Pending Calibration Maintenance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-y border-gray-100">
              <tr>
                <th className="py-3 px-4">Equipment</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Serial No</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Action Status</th>
              </tr>
            </thead>
            <tbody>
              {records
                .map(r => ({ record: r, comp: computeRecordFields(r) }))
                .filter(item => item.comp.reminderStatus !== '✅ OK')
                .sort((a, b) => a.comp.calibrationRemainingDays - b.comp.calibrationRemainingDays)
                .map(({ record, comp }) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{record.description}</td>
                    <td className="py-3 px-4">
                       <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">{record.internalCompany}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">{record.serialNumber}</td>
                    <td className="py-3 px-4">{new Date(record.calibrationDueDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        comp.reminderStatus === '❌ EXPIRED' ? 'bg-red-600 text-white' : 
                        comp.reminderStatus === '⚠️ URGENT' ? 'bg-orange-500 text-white' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {comp.reminderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
