
import React, { useState, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Calendar, FileDown, MoreVertical,
  AlertTriangle, CheckCircle, CheckCircle2, Clock, Building2, Download, FileText, 
  Paperclip, Share2, Copy, Check, ChevronRight, MessageCircle, 
  CreditCard, Receipt, FolderOpen, Upload, FileSpreadsheet, ShieldCheck, Truck, Lock, Unlock, Shield
} from 'lucide-react';
import { EquipmentRecord, ComputedFields, ApprovalStatus, Attachment } from '../types';
import { computeRecordFields, formatCurrency } from '../utils/calculations';
import { format, isValid } from 'date-fns';
import AdminInvoiceModal from './AdminInvoiceModal';

interface EquipmentTableProps {
  records: EquipmentRecord[];
  onAdd: () => void;
  onEdit: (record: EquipmentRecord) => void;
  onDelete: (id: string) => void;
  onQuickUpload: (record: EquipmentRecord) => void;
  onExcelImport: (file: File) => void;
  isAdmin: boolean;
  onUpdateRecord: (record: EquipmentRecord) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'A': 'bg-green-600 text-white border-green-700 shadow-green-100',
  'AWC': 'bg-blue-600 text-white border-blue-700 shadow-blue-100',
  'RE': 'bg-orange-500 text-white border-orange-600 shadow-orange-100',
  'C': 'bg-gray-500 text-white border-gray-600 shadow-gray-100',
  'R': 'bg-red-600 text-white border-red-700 shadow-red-100',
  'N/A': 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
};

const safeFormat = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isValid(d) ? d.toLocaleDateString() : 'Invalid Date';
};

const EquipmentTable: React.FC<EquipmentTableProps> = ({ records, onAdd, onEdit, onDelete, onQuickUpload, onExcelImport, isAdmin, onUpdateRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [adminModalRecord, setAdminModalRecord] = useState<EquipmentRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = records.filter(r => 
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rentalCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.internalCompany.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const data = records.map(record => {
      const comp = computeRecordFields(record);
      return {
        slNo: record.slNo,
        description: record.description,
        serialNumber: record.serialNumber,
        unit: record.unit,
        qty: record.qty,
        ownership: record.ownershipType,
        internalCompany: record.internalCompany,
        rentalCompany: record.rentalCompany,
        rateType: record.rateType,
        rateValue: record.rateValue,
        received: record.kitReceivedDate,
        returned: record.kitReturnedDate || "ACTIVE",
        days: comp.daysUsing,
        cost: comp.rentalCost.toFixed(2),
        invoice: record.invoiceNumber,
        month: record.claimMonth,
        status: comp.pendingClaimStatus,
        approval: record.approvalStatus || 'N/A',
        paymentDone: record.isPaymentDone ? "YES" : "NO",
        pending: comp.pendingAmount.toFixed(2),
        calibDue: record.calibrationDueDate,
        remarks: record.remarks || ""
      };
    });

    const headers = [
      "SL NO", "DESCRIPTION", "SERIAL NUMBER", "UNIT", "QTY", "Ownership", "Internal Company",
      "Rental Company Name", "Kit Rate Type", "Rate Value", "Kit Received Date",
      "Kit Returned Date", "No. of Days Using", "Rental Cost (SAR)", "Invoice Number",
      "Claim Month", "Claim Status", "Approval Status", "Payment Done", "Pending Amount", "Calibration Due Date", "Remarks"
    ];

    const csvContent = [
      headers.join(","),
      ...data.map(d => Object.values(d).map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EquipTrack_Register_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const copyForGoogleSheets = () => {
    const tsvContent = records.map(record => {
      const comp = computeRecordFields(record);
      return [
        record.slNo, record.description, record.serialNumber, record.unit, record.qty, 
        record.internalCompany, record.rentalCompany, record.rateType, record.rateValue,
        record.kitReceivedDate, record.kitReturnedDate || "ACTIVE", comp.daysUsing,
        comp.rentalCost.toFixed(2), record.invoiceNumber, record.claimMonth,
        comp.pendingClaimStatus, record.approvalStatus || 'N/A', record.isPaymentDone ? "YES" : "NO",
        comp.pendingAmount.toFixed(2), record.calibrationDueDate, record.remarks || ""
      ].join("\t");
    }).join("\n");
    
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadFile = (data: string, name: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    link.click();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="relative flex-1 max-md:max-w-none max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Quick search register..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-600 transition-all text-sm text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx,.xls,.csv" 
            onChange={(e) => e.target.files?.[0] && onExcelImport(e.target.files[0])} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-gray-700 transition-all border border-slate-200 dark:border-gray-700"
          >
            <FileSpreadsheet size={16} />
            Import Excel
          </button>

          <div className="flex items-center bg-green-50 dark:bg-green-900/20 rounded-xl p-1 border border-green-100 dark:border-green-800">
            <button
              onClick={copyForGoogleSheets}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                copied ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none' : 'text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Sheet Sync'}
            </button>
            <div className="w-[1px] h-4 bg-green-200 dark:bg-green-800 mx-2"></div>
            <button onClick={exportToCSV} className="p-1.5 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors" title="Export Full Register as CSV">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[calc(100vh-280px)] scrollbar-thin">
        <table className="w-full text-left text-sm min-w-[2400px]">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-black tracking-widest sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="py-4 px-4">SL</th>
              <th className="py-4 px-4">Equipment Details</th>
              <th className="py-4 px-4">Rental Vendor</th>
              <th className="py-4 px-4 text-center">Rental Period</th>
              <th className="py-4 px-4">Total Cost</th>
              <th className="py-4 px-4">Claim Progress</th>
              <th className="py-4 px-4">
                 <div className="flex items-center gap-2">
                    Approval Status
                    {isAdmin ? <Shield size={12} className="text-emerald-500" /> : <Lock size={12} className="text-slate-400" />}
                 </div>
              </th>
              <th className="py-4 px-4">Files & Docs</th>
              <th className="py-4 px-4 text-center">
                 <div className="flex items-center justify-center gap-2">
                    Payment Status
                    {isAdmin ? <Shield size={12} className="text-emerald-500" /> : <Lock size={12} className="text-slate-400" />}
                 </div>
              </th>
              <th className="py-4 px-4">Calibration</th>
              <th className="py-4 px-4 sticky right-0 bg-gray-50 dark:bg-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-20 text-center text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 font-bold">
                   No equipment found matching your search.
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const computed = computeRecordFields(record);
                const hasAdminComments = record.adminComments && record.adminComments.length > 0;
                
                return (
                  <tr key={record.id} className="hover:bg-blue-50/10 dark:hover:bg-green-900/10 transition-colors group bg-white dark:bg-gray-900">
                    <td className="py-4 px-4 font-mono text-gray-300 dark:text-gray-600">#{record.slNo}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1.5 rounded-lg border ${
                          record.ownershipType === 'Own' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                            : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                        }`} title={record.ownershipType}>
                          {record.ownershipType === 'Own' ? <ShieldCheck size={14} /> : <Truck size={14} />}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                            {record.description}
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
                              record.ownershipType === 'Own' ? 'bg-emerald-600 text-white' : 'bg-blue-600 dark:bg-blue-500 text-white'
                            }`}>
                              {record.ownershipType.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">SN: {record.serialNumber}</div>
                          <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-tighter">{record.internalCompany}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-black text-gray-700 dark:text-gray-300">{record.rentalCompany}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">{record.rateType} @ {formatCurrency(record.rateValue)}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                          <div className="text-[9px] text-gray-400 uppercase font-black">Received</div>
                          <div className="text-xs font-bold text-gray-600 dark:text-gray-300">{safeFormat(record.kitReceivedDate)}</div>
                        </div>
                        <ChevronRight size={14} className="text-gray-200 dark:text-gray-700" />
                        <div className="text-center">
                          <div className="text-[9px] text-gray-400 uppercase font-black">Returned</div>
                          <div className="text-xs font-bold text-gray-600 dark:text-gray-300">
                            {record.kitReturnedDate ? safeFormat(record.kitReturnedDate) : <span className="text-blue-500 dark:text-green-400">ACTIVE</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[10px] text-gray-400 font-black">{computed.daysUsing} DAYS</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(computed.rentalCost)}</div>
                      {computed.pendingAmount > 0 && (
                        <div className="text-[9px] text-red-500 font-black italic mt-0.5">UNPAID: {formatCurrency(computed.pendingAmount)}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black w-fit border ${
                          computed.pendingClaimStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                          computed.pendingClaimStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 
                          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                        }`}>
                          {computed.pendingClaimStatus}
                        </span>
                        {record.invoiceNumber && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold tracking-tighter">INV: {record.invoiceNumber}</span>}
                        <div className="text-[9px] text-gray-400 font-black uppercase">{record.claimMonth}</div>
                      </div>
                    </td>
                    
                    {/* Approval Status - Strict Role Separation */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          // ADMIN VIEW: Clickable Button
                           <button 
                             onClick={() => setAdminModalRecord(record)}
                             className={`w-12 h-7 flex items-center justify-center rounded-lg text-[10px] font-black border shadow-sm transition-transform hover:scale-105 ${STATUS_COLORS[record.approvalStatus || 'N/A']}`}
                           >
                            {record.approvalStatus || 'N/A'}
                          </button>
                        ) : (
                          // USER VIEW: Read-Only Badge + Lock Icon
                          <div className={`w-12 h-7 flex items-center justify-center rounded-lg text-[10px] font-black border opacity-70 cursor-not-allowed ${STATUS_COLORS[record.approvalStatus || 'N/A']}`}>
                             {record.approvalStatus || 'N/A'}
                          </div>
                        )}
                        
                        {hasAdminComments && (
                          <div className="text-[8px] flex items-center gap-1 text-slate-400 bg-slate-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-gray-700" title="Admin Comments Available">
                             <MessageCircle size={10} />
                             {record.adminComments?.length}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(record.attachments || []).length > 0 ? (
                          record.attachments.map(att => (
                            <button 
                              key={att.id}
                              onClick={() => downloadFile(att.data, att.name)}
                              className={`p-2 rounded-lg border shadow-sm transition-all hover:scale-110 ${
                                att.category === 'Invoice' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                att.category === 'Receipt' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                              }`}
                              title={`Download ${att.category}: ${att.name}`}
                            >
                              {att.category === 'Invoice' ? <FileText size={16} /> : 
                               att.category === 'Receipt' ? <Receipt size={16} /> : <Paperclip size={16} />}
                            </button>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-300 dark:text-gray-600 font-bold uppercase italic tracking-tighter">No Docs</span>
                        )}
                        {/* Users can still upload, but cannot approve */}
                        <button 
                          onClick={() => onQuickUpload(record)}
                          className="p-2 rounded-lg border border-dashed border-blue-200 dark:border-green-700 text-blue-400 dark:text-green-500 hover:bg-blue-50 dark:hover:bg-green-900/20 hover:text-blue-600 dark:hover:text-green-400 hover:border-blue-400 dark:hover:border-green-500 transition-all flex items-center gap-1"
                          title="Upload new file to this entry"
                        >
                          <Upload size={14} />
                          <span className="text-[9px] font-black uppercase">ADD</span>
                        </button>
                      </div>
                    </td>

                    {/* Payment Status - Strict Role Separation */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        {isAdmin ? (
                          // ADMIN VIEW: Clickable to Open Modal
                          <button 
                             onClick={() => setAdminModalRecord(record)}
                             className="flex flex-col items-center hover:opacity-80 transition-opacity"
                          >
                            {record.isPaymentDone ? (
                              <>
                                <div className="p-2 bg-green-50 text-green-600 border border-green-100 rounded-full mb-1 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                  <CheckCircle2 size={18} />
                                </div>
                                <span className="text-[9px] font-black text-green-700 dark:text-green-400">COMPLETED</span>
                              </>
                            ) : (
                              <>
                                <div className="p-2 bg-gray-50 text-gray-300 border border-gray-100 rounded-full mb-1 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700">
                                  <Clock size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600">PENDING</span>
                              </>
                            )}
                          </button>
                        ) : (
                          // USER VIEW: Static Status
                           <div className="flex flex-col items-center opacity-80 cursor-default">
                            {record.isPaymentDone ? (
                              <>
                                <div className="p-2 bg-green-50 text-green-600 border border-green-100 rounded-full mb-1 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                  <CheckCircle2 size={18} />
                                </div>
                                <span className="text-[9px] font-black text-green-700 dark:text-green-400">PAID</span>
                              </>
                            ) : (
                              <>
                                <div className="p-2 bg-gray-50 text-gray-300 border border-gray-100 rounded-full mb-1 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700">
                                  <Lock size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600">LOCKED</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className={`text-[10px] font-black uppercase tracking-tighter ${
                          computed.reminderStatus.includes('OK') ? 'text-green-600 dark:text-green-400' : 
                          computed.reminderStatus.includes('SOON') ? 'text-yellow-600 dark:text-yellow-400' : 
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {computed.reminderStatus}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold">Due: {safeFormat(record.calibrationDueDate)}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-blue-50/10 dark:group-hover:bg-green-900/10 transition-colors border-l border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onEdit(record)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:text-green-400 dark:hover:bg-green-900/40 rounded-xl transition-all" title="Edit Entry"><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(record.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Delete Entry"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {copied && (
        <div className="fixed bottom-8 right-8 bg-slate-900 dark:bg-green-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slideUp z-[100] border border-slate-700 dark:border-green-700">
          <div className="bg-green-500 p-1.5 rounded-full"><Check size={20} /></div>
          <div>
            <p className="text-sm font-black">Copied for Google Sheets!</p>
            <p className="text-[10px] text-slate-400 dark:text-green-300 font-bold uppercase tracking-widest">Pasting ready for SL NO mapping</p>
          </div>
        </div>
      )}

      {adminModalRecord && (
        <AdminInvoiceModal 
           record={adminModalRecord}
           onClose={() => setAdminModalRecord(null)}
           onSave={(updated) => onUpdateRecord(updated)}
        />
      )}
    </div>
  );
};

export default EquipmentTable;
