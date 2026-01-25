
import React, { useState } from 'react';
import { Search, Download, FileText, Receipt, FolderOpen, Calendar, Building2, Eye, Upload, PlusCircle } from 'lucide-react';
import { EquipmentRecord, Attachment } from '../types';

interface DocumentsViewProps {
  records: EquipmentRecord[];
  onUploadRequest: (record: EquipmentRecord) => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ records, onUploadRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Attachment['category'] | 'All'>('All');

  // Flatten all attachments from all records
  const allDocuments = records.flatMap(record => 
    (record.attachments || []).map(att => ({
      ...att,
      equipmentName: record.description,
      equipmentSN: record.serialNumber,
      company: record.internalCompany,
      vendor: record.rentalCompany,
      parentRecord: record
    }))
  ).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  const filteredDocs = allDocuments.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.equipmentSN.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const downloadFile = (data: string, name: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upload Promo Section */}
      <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Centralized Documents Repository</h3>
          <p className="text-sm text-slate-500 font-medium">Quickly browse all uploaded invoices, certificates, and receipts across all projects. Click "Upload File" to attach a new document to an equipment record.</p>
        </div>
        <div className="flex-shrink-0 z-10 flex flex-wrap justify-center gap-3">
            <div className="group relative">
                <select 
                    onChange={(e) => {
                        const rec = records.find(r => r.id === e.target.value);
                        if (rec) onUploadRequest(rec);
                        e.target.value = '';
                    }}
                    className="appearance-none bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 cursor-pointer pr-12"
                >
                    <option value="" className="bg-white text-slate-900">Upload to Record...</option>
                    {records.map(r => (
                        <option key={r.id} value={r.id} className="bg-white text-slate-900">{r.description} ({r.serialNumber})</option>
                    ))}
                </select>
                <Upload size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 pointer-events-none" />
            </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-12 pointer-events-none">
            <FolderOpen size={240} className="text-blue-600" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by filename, equipment name, or serial number..."
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {['All', 'Invoice', 'Receipt', 'Manual', 'Certificate', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${
                filterCategory === cat 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center opacity-70">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
                <FolderOpen size={64} className="text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-900 uppercase tracking-widest mb-1">No documents found</p>
            <p className="text-sm text-slate-400 font-medium">Try searching for something else or upload a new document.</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group border-t-8 border-t-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl shadow-sm ${
                  doc.category === 'Invoice' ? 'bg-blue-50 text-blue-600' :
                  doc.category === 'Receipt' ? 'bg-green-50 text-green-600' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {doc.category === 'Invoice' ? <FileText size={32} /> : 
                   doc.category === 'Receipt' ? <Receipt size={32} /> : <FolderOpen size={32} />}
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => downloadFile(doc.data, doc.name)}
                    className="p-3 bg-blue-600 text-white shadow-lg shadow-blue-100 rounded-2xl hover:bg-blue-700 transition-all transform active:scale-95"
                    title="Download File"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mb-5">
                <h4 className="text-sm font-black text-slate-900 line-clamp-2 min-h-[40px]" title={doc.name}>{doc.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                    doc.category === 'Invoice' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    doc.category === 'Receipt' ? 'bg-green-50 text-green-700 border-green-100' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-700">
                  <Building2 size={16} className="text-slate-300 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight line-clamp-1">{doc.equipmentName}</p>
                    <p className="text-[9px] text-slate-400 font-mono">SN: {doc.equipmentSN}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar size={16} className="text-slate-300 flex-shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-widest truncate">{doc.vendor}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsView;
