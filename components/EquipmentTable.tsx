
import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Calendar, FileDown, MoreVertical,
  AlertTriangle, CheckCircle, CheckCircle2, Clock, Building2, Download, FileText, 
  Paperclip, Share2, Copy, Check, ChevronRight, MessageCircle, 
  CreditCard, Receipt, FolderOpen
} from 'lucide-react';
import { EquipmentRecord, ComputedFields, ApprovalStatus, Attachment } from '../types';
import { computeRecordFields, formatCurrency } from '../utils/calculations';

interface EquipmentTableProps {
  records: EquipmentRecord[];
  onAdd: () => void;
  onEdit: (record: EquipmentRecord) => void;
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'A': 'bg-green-600 text-white border-green-700 shadow-green-100',
  'AWC': 'bg-blue-600 text-white border-blue-700 shadow-blue-100',
  'RE': 'bg-orange-500 text-white border-orange-600 shadow-orange-100',
  'C': 'bg-gray-500 text-white border-gray-600 shadow-gray-100',
  'R': 'bg-red-600 text-white border-red-700 shadow-red-100',
  'N/A': 'bg-gray-100 text-gray-400 border-gray-200'
};

const EquipmentTable: React.FC<EquipmentTableProps> = ({ records, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredRecords = records.filter(r => 
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rentalCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.internalCompany.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExportData = () => {
    return records.map(record => {
      const comp = computeRecordFields(record);
      return {
        slNo: record.slNo,
        description: record.description,
        serialNumber: record.serialNumber,
        unit: record.unit,
        qty: record.qty,
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
        paymentDate: record.paymentDate || "",
        pending: comp.pendingAmount.toFixed(2),
        calibDue: record.calibrationDueDate,
        calibRem: comp.calibrationRemainingDays,
        reminder: comp.reminderStatus,
        remarks: record.remarks || "",
        filesCount: (record.attachments || []).length
      };
    });
  };

  const exportToCSV = () => {
    const data = getExportData();
    const headers = [
      "SL NO", "DESCRIPTION", "SERIAL NUMBER", "UNIT", "QTY", "Internal Company",
      "Rental Company Name", "Kit Rate Type", "Rate Value", "Kit Received Date",
      "Kit Returned Date", "No. of Days Using", "Rental Cost (SAR)", "Invoice Number",
      "Claim Month", "Claim Status", "Approval Status", "Payment Done", "Payment Date", "Pending Amount", "Calibration Due Date",
      "Calibration Remaining Days", "Reminder Status", "Remarks", "Total Files"
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
    const data = getExportData();
    const tsvContent = data.map(d => Object.values(d).join("\t")).join("\n");
    
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white sticky top-0 z-10">
        <div className="relative flex-1 max-md:max-w-none max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search register..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-green-50 rounded-lg p-1 border border-green-100">
            <button
              onClick={copyForGoogleSheets}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
                copied ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-100'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy for Sheet'}
            </button>
            <div className="w-[1px] h-4 bg-green-200 mx-1"></div>
            <button onClick={exportToCSV} className="p-1.5 text-green-700 hover:bg-green-100 rounded-md transition-colors" title="Export CSV">
              <Download size={14} />
            </button>
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Entry
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[calc(100vh-280px)] scrollbar-thin">
        <table className="w-full text-left text-sm min-w-[2200px]">
          <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-black tracking-widest sticky top-0 z-10 border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">SL</th>
              <th className="py-3 px-4">Equipment Details</th>
              <th className="py-3 px-4">Rental Vendor</th>
              <th className="py-3 px-4 text-center">Rental Period</th>
              <th className="py-3 px-4">Total Cost</th>
              <th className="py-3 px-4">Workflow Status</th>
              <th className="py-3 px-4">Approval</th>
              <th className="py-3 px-4">Files</th>
              <th className="py-3 px-4 text-center">Payment Status</th>
              <th className="py-3 px-4">Calibration</th>
              <th className="py-3 px-4 sticky right-0 bg-gray-50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-gray-400 bg-white font-bold">
                  No records found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const computed = computeRecordFields(record);
                return (
                  <tr key={record.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="py-4 px-4 font-mono text-gray-300">#{record.slNo}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{record.description}</div>
                      <div className="text-[10px] text-gray-400 font-mono">S/N: {record.serialNumber}</div>
                      <div className="text-[10px] font-bold text-blue-600 mt-0.5">{record.internalCompany}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-gray-700">{record.rentalCompany}</div>
                      <div className="text-[10px] text-gray-500">{record.rateType} @ {formatCurrency(record.rateValue)}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                          <div className="text-[9px] text-gray-400 uppercase font-bold">In</div>
                          <div className="text-xs font-medium">{new Date(record.kitReceivedDate).toLocaleDateString()}</div>
                        </div>
                        <ChevronRight size={14} className="text-gray-200" />
                        <div className="text-center">
                          <div className="text-[9px] text-gray-400 uppercase font-bold">Out</div>
                          <div className="text-xs font-medium">
                            {record.kitReturnedDate ? new Date(record.kitReturnedDate).toLocaleDateString() : 'ACTIVE'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[10px] text-gray-400 font-bold">{computed.daysUsing} DAYS</div>
                      <div className="text-sm font-black text-blue-900">{formatCurrency(computed.rentalCost)}</div>
                      {computed.pendingAmount > 0 && (
                        <div className="text-[9px] text-red-500 font-bold italic">PENDING: {formatCurrency(computed.pendingAmount)}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black w-fit border ${
                          computed.pendingClaimStatus === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' :
                          computed.pendingClaimStatus === 'SUBMITTED' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {computed.pendingClaimStatus}
                        </span>
                        {record.invoiceNumber && <span className="text-[10px] text-gray-500 font-mono">#{record.invoiceNumber}</span>}
                        <div className="text-[9px] text-gray-400 font-bold">{record.claimMonth}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                         <span className={`w-10 h-6 flex items-center justify-center rounded text-[10px] font-black border shadow-sm ${STATUS_COLORS[record.approvalStatus || 'N/A']}`}>
                          {record.approvalStatus || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[120px]">
                        {(record.attachments || []).length > 0 ? (
                          record.attachments.map(att => (
                            <button 
                              key={att.id}
                              onClick={() => downloadFile(att.data, att.name)}
                              className={`p-1.5 rounded-lg border transition-all hover:scale-110 ${
                                att.category === 'Invoice' ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white' :
                                att.category === 'Receipt' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white' :
                                'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-600 hover:text-white'
                              }`}
                              title={`${att.category}: ${att.name}`}
                            >
                              {att.category === 'Invoice' ? <FileText size={14} /> : 
                               att.category === 'Receipt' ? <Receipt size={14} /> : <Paperclip size={14} />}
                            </button>
                          ))
                        ) : (
                          <span className="text-[9px] text-gray-300 font-bold uppercase italic tracking-tighter">No Files</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        {record.isPaymentDone ? (
                          <div className="flex flex-col items-center">
                            <div className="p-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 mb-1">
                              <CheckCircle2 size={16} />
                            </div>
                            <span className="text-[9px] font-black text-green-700">PAID</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="p-1.5 bg-gray-50 text-gray-300 rounded-full border border-gray-100 mb-1">
                              <Clock size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400">PENDING</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className={`text-[10px] font-black ${
                          computed.reminderStatus.includes('OK') ? 'text-green-600' : 
                          computed.reminderStatus.includes('SOON') ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {computed.reminderStatus}
                        </div>
                        <div className="text-[10px] text-gray-400">Due: {new Date(record.calibrationDueDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sticky right-0 bg-white group-hover:bg-blue-50/20 transition-colors border-l border-gray-50">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(record)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => onDelete(record.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"><Trash2 size={14} /></button>
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
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slideUp z-[100] border border-gray-700">
          <div className="bg-green-500 p-1 rounded-full"><Check size={16} /></div>
          <span className="text-sm font-bold">Register copied for Google Sheets!</span>
        </div>
      )}
    </div>
  );
};

export default EquipmentTable;
