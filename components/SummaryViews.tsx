
import React, { useState } from 'react';
import { EquipmentRecord, CalibrationStatus, ApprovalStatus, Attachment } from '../types';
import { computeRecordFields, formatCurrency } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Upload, Download, FileCheck, Loader2, Search, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { scanCalibrationCertificate } from '../utils/ai';

interface SummaryProps {
  records: EquipmentRecord[];
  onUpdateRecord?: (updatedRecord: EquipmentRecord) => void;
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

export const CalibrationSummary: React.FC<SummaryProps> = ({ records, onUpdateRecord }) => {
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>, record: EquipmentRecord) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateRecord) return;

    setScanningId(record.id);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const mimeType = file.type;

      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        data: base64Data,
        type: mimeType,
        uploadedAt: new Date().toISOString(),
        category: 'Certificate'
      };

      const extracted = await scanCalibrationCertificate(base64Data, mimeType);
      
      let updatedRecord = {
        ...record,
        attachments: [...(record.attachments || []), newAttachment]
      };

      if (extracted) {
        const confirmUpdate = window.confirm(
          `AI Extracted Details:\n\n` +
          `Lab: ${extracted.labName}\n` +
          `Cert #: ${extracted.certificateNumber}\n` +
          `Next Due: ${extracted.nextDueDate}\n\n` +
          `Do you want to update the calibration due date automatically?`
        );

        if (confirmUpdate) {
          updatedRecord.calibrationDueDate = extracted.nextDueDate;
          updatedRecord.remarks = `${record.remarks || ''}\n[AI SCAN] Cert: ${extracted.certificateNumber} by ${extracted.labName} on ${extracted.calibrationDate}`.trim();
        }
      }

      onUpdateRecord(updatedRecord);
      setScanningId(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePrintCert = (attachment: Attachment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isPdf = attachment.type === 'application/pdf';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate - ${attachment.name}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          ${isPdf ? 
            `<embed src="${attachment.data}" type="application/pdf" width="100%" height="100%" />` : 
            `<img src="${attachment.data}" onload="window.print();window.close();" />`
          }
        </body>
      </html>
    `);

    if (isPdf) {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const filtered = records.filter(r => 
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { status: '✅ OK', count: records.filter(r => computeRecordFields(r).reminderStatus === '✅ OK').length, color: 'text-green-600', bg: 'bg-green-50' },
    { status: '🔔 DUE SOON', count: records.filter(r => computeRecordFields(r).reminderStatus === '🔔 DUE SOON').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { status: '⚠️ URGENT', count: records.filter(r => computeRecordFields(r).reminderStatus === '⚠️ URGENT').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { status: '❌ EXPIRED', count: records.filter(r => computeRecordFields(r).reminderStatus === '❌ EXPIRED').length, color: 'text-red-600', bg: 'bg-red-50' },
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold">Calibration Maintenance & Certificates</h3>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search equipment..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-y border-gray-100">
              <tr>
                <th className="py-4 px-6">Equipment</th>
                <th className="py-4 px-6">Entity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Last Certificate</th>
                <th className="py-4 px-6 text-center">Certificate Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered
                .map(r => ({ record: r, comp: computeRecordFields(r) }))
                .sort((a, b) => a.comp.calibrationRemainingDays - b.comp.calibrationRemainingDays)
                .map(({ record, comp }) => {
                  const certificates = (record.attachments || []).filter(a => a.category === 'Certificate');
                  const lastCert = certificates[certificates.length - 1];

                  return (
                    <tr key={record.id} className="hover:bg-blue-50/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{record.description}</div>
                        <div className="text-[10px] font-mono text-gray-400">SN: {record.serialNumber}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">{record.internalCompany}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          comp.reminderStatus === '✅ OK' ? 'bg-green-100 text-green-700' :
                          comp.reminderStatus === '❌ EXPIRED' ? 'bg-red-600 text-white shadow-sm' : 
                          comp.reminderStatus === '⚠️ URGENT' ? 'bg-orange-500 text-white shadow-sm' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {comp.reminderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-600">
                        {new Date(record.calibrationDueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        {lastCert ? (
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <FileCheck size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold truncate max-w-[120px]">{lastCert.name}</div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase">{new Date(lastCert.uploadedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-bold uppercase italic italic">Missing</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {scanningId === record.id ? (
                            <div className="flex items-center gap-2 text-blue-600 px-4 py-2 bg-blue-50 rounded-xl">
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Scanning AI...</span>
                            </div>
                          ) : (
                            <>
                              <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 cursor-pointer shadow-lg shadow-slate-200 transition-all">
                                <Upload size={14} />
                                <span>Upload</span>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleCertUpload(e, record)} />
                              </label>
                              {lastCert && (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => handlePrintCert(lastCert)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    title="Direct Print Certificate"
                                  >
                                    <Printer size={18} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = lastCert.data;
                                      link.download = lastCert.name;
                                      link.click();
                                    }}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    title="Download Latest Certificate"
                                  >
                                    <Download size={18} />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white flex items-center gap-6 shadow-xl shadow-blue-200 overflow-hidden relative">
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
          <CheckCircle2 size={32} />
        </div>
        <div className="relative z-10">
          <h4 className="text-lg font-black uppercase tracking-tight">Pro Tip: AI Date Sync</h4>
          <p className="text-sm text-blue-100 font-medium">Our Gemini 3 model can automatically detect the next calibration due date from your uploaded certificates. Try uploading a clear image or PDF!</p>
        </div>
        <AlertCircle size={160} className="absolute -right-10 -bottom-10 text-white opacity-5 rotate-12" />
      </div>
    </div>
  );
};
