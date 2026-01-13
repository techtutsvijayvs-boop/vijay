
import React, { useState } from 'react';
import { Search, Download, FileText, Receipt, FolderOpen, Calendar, Building2, Eye } from 'lucide-react';
import { EquipmentRecord, Attachment } from '../types';

interface DocumentsViewProps {
  records: EquipmentRecord[];
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Attachment['category'] | 'All'>('All');

  // Flatten all attachments from all records
  const allDocuments = records.flatMap(record => 
    (record.attachments || []).map(att => ({
      ...att,
      equipmentName: record.description,
      equipmentSN: record.serialNumber,
      company: record.internalCompany,
      vendor: record.rentalCompany
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
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search filenames, equipment, SN..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', 'Invoice', 'Receipt', 'Manual', 'Certificate', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center opacity-50">
            <FolderOpen size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-black text-gray-400 uppercase tracking-widest">No documents found</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${
                  doc.category === 'Invoice' ? 'bg-blue-50 text-blue-600' :
                  doc.category === 'Receipt' ? 'bg-green-50 text-green-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {doc.category === 'Invoice' ? <FileText size={24} /> : 
                   doc.category === 'Receipt' ? <Receipt size={24} /> : <FolderOpen size={24} />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => downloadFile(doc.data, doc.name)}
                    className="p-2 bg-gray-50 text-gray-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                    title="Download File"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-black text-gray-900 truncate" title={doc.name}>{doc.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    doc.category === 'Invoice' ? 'bg-blue-100 text-blue-700' :
                    doc.category === 'Receipt' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {doc.category}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 size={12} className="flex-shrink-0" />
                  <p className="text-[10px] font-bold truncate">{doc.equipmentName}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={12} className="flex-shrink-0" />
                  <p className="text-[10px] font-medium truncate">{doc.vendor} (Vendor)</p>
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
