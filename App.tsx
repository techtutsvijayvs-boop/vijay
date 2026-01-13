
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Settings, LogOut, ChevronRight, X, Building2, Upload, FileText, CheckCircle2, MessageSquare, CreditCard, Receipt, FolderOpen, Trash2, Download } from 'lucide-react';
import { EquipmentRecord, RentalContract, RateType, ApprovalStatus, Attachment } from './types';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import ContractMaster from './components/ContractMaster';
import DocumentsView from './components/DocumentsView';
import { InvoiceSummary, CalibrationSummary } from './components/SummaryViews';
import { format } from 'date-fns';

const INTERNAL_COMPANIES = [
  'Main Site Office',
  'Project Alpha - Dammam',
  'Project Beta - Jeddah',
  'Muwalyh Site',
  'Nexus Engineering',
  'Alpha Build Ltd',
  'Omega Constructions'
];

const APPROVAL_OPTIONS: { code: ApprovalStatus; label: string; color: string }[] = [
  { code: 'N/A', label: 'Not Applicable', color: 'text-gray-400' },
  { code: 'A', label: 'Approved', color: 'text-green-600' },
  { code: 'AWC', label: 'Approved With Comments', color: 'text-blue-600' },
  { code: 'RE', label: 'Review', color: 'text-orange-600' },
  { code: 'C', label: 'Cancel', color: 'text-gray-600' },
  { code: 'R', label: 'Reject', color: 'text-red-600' },
];

const INITIAL_RECORDS: EquipmentRecord[] = [
  {
    id: 'rec_1',
    slNo: 1,
    description: 'Freja Relay kit',
    serialNumber: '24121089/1201538',
    unit: 'set',
    qty: 1,
    internalCompany: 'Project Alpha - Dammam',
    rentalCompany: 'Digital Energy',
    rateType: 'Daily',
    rateValue: 450,
    kitReceivedDate: '2025-09-01',
    kitReturnedDate: null,
    invoiceNumber: '',
    claimMonth: 'September 2025',
    remarks: 'Active deployment',
    calibrationDueDate: '2025-12-07',
    approvalStatus: 'N/A',
    isPaymentDone: false,
    attachments: []
  },
  {
    id: 'rec_6',
    slNo: 6,
    description: 'CMC 256',
    serialNumber: 'ME494L',
    unit: 'set',
    qty: 1,
    internalCompany: 'Project Beta - Jeddah',
    rentalCompany: 'KANOO',
    rateType: 'Monthly',
    rateValue: 8500,
    kitReceivedDate: '2025-09-29',
    kitReturnedDate: null,
    invoiceNumber: 'INV-K-442',
    claimMonth: 'September 2025',
    remarks: 'Yellow Highlighted in Register',
    calibrationDueDate: '2026-06-03',
    approvalStatus: 'A',
    isPaymentDone: true,
    paymentDate: '2025-10-15',
    attachments: []
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'contracts' | 'invoices' | 'calibration' | 'documents'>('dashboard');
  const [records, setRecords] = useState<EquipmentRecord[]>([]);
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EquipmentRecord | null>(null);
  
  // Local state for attachments being uploaded in the current modal session
  const [modalAttachments, setModalAttachments] = useState<Attachment[]>([]);
  
  useEffect(() => {
    const savedRecords = localStorage.getItem('equip_records');
    const savedContracts = localStorage.getItem('equip_contracts');
    
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    } else {
      setRecords(INITIAL_RECORDS);
      localStorage.setItem('equip_records', JSON.stringify(INITIAL_RECORDS));
    }

    if (savedContracts) {
      setContracts(JSON.parse(savedContracts));
    } else {
      setContracts([]);
    }
  }, []);

  const saveToStorage = (newRecords: EquipmentRecord[]) => {
    localStorage.setItem('equip_records', JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const handleAddEdit = (formData: any) => {
    if (editingRecord) {
      const updated = records.map(r => r.id === editingRecord.id ? { 
        ...r, 
        ...formData,
        attachments: modalAttachments
      } : r);
      saveToStorage(updated);
    } else {
      const newRecord: EquipmentRecord = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        slNo: records.length + 1,
        attachments: modalAttachments
      };
      saveToStorage([...records, newRecord]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setModalAttachments([]);
  };

  const openModal = (record?: EquipmentRecord) => {
    if (record) {
      setEditingRecord(record);
      setModalAttachments(record.attachments || []);
    } else {
      setEditingRecord(null);
      setModalAttachments([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const updated = records.filter(r => r.id !== id);
      saveToStorage(updated);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: Attachment['category']) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          data: reader.result as string,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          category
        };
        setModalAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setModalAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <nav className="w-full lg:w-64 bg-[#0F172A] text-white flex-shrink-0 z-20 shadow-xl">
        <div className="p-6">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
            <Layout className="text-blue-500" />
            EQUIPTRACK<span className="text-blue-400">PRO</span>
          </h1>
        </div>
        
        <div className="px-4 py-2 space-y-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Menu size={18} />} label="Dashboard" />
          <NavItem active={activeTab === 'register'} onClick={() => setActiveTab('register')} icon={<ChevronRight size={18} />} label="Equipment Register" />
          <NavItem active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} icon={<Settings size={18} />} label="Contract Master" />
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Financials</div>
          <NavItem active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} icon={<FileText size={18} />} label="Invoices & Claims" />
          <NavItem active={activeTab === 'calibration'} onClick={() => setActiveTab('calibration')} icon={<CheckCircle2 size={18} />} label="Calibration Track" />
          <NavItem active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FolderOpen size={18} />} label="Documents Center" />
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800 hidden lg:block">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs uppercase shadow-inner">AM</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Admin Manager</p>
              <p className="text-[10px] text-gray-400">Project KSA</p>
            </div>
            <LogOut size={14} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
            <p className="text-sm text-gray-500 mt-1">Management of Equipment Documents, Payments and Calibration</p>
          </div>
          <div className="text-[10px] font-bold text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#10B981]"></span>
            System Live: {format(new Date(), 'PPpp')}
          </div>
        </header>

        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && <Dashboard records={records} />}
          {activeTab === 'register' && (
            <EquipmentTable 
              records={records} 
              onAdd={() => openModal()} 
              onEdit={(r) => openModal(r)}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractMaster 
              contracts={contracts} 
              onAdd={() => {}} 
              onDelete={(id) => setContracts(contracts.filter(c => c.id !== id))} 
            />
          )}
          {activeTab === 'invoices' && <InvoiceSummary records={records} />}
          {activeTab === 'calibration' && <CalibrationSummary records={records} />}
          {activeTab === 'documents' && <DocumentsView records={records} />}
        </div>
      </main>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-slideUp border border-white/20">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Building2 size={20} />
                </div>
                {editingRecord ? `Edit Equipment: ${editingRecord.description}` : 'Create New Entry'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto max-h-[85vh]" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              handleAddEdit({
                ...data,
                unit: data.unit || 'set',
                qty: Number(data.qty) || 1,
                rateValue: Number(data.rateValue),
                kitReturnedDate: data.kitReturnedDate || null,
                isPaymentDone: data.isPaymentDone === 'on'
              });
            }}>
              {/* Basic Details */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Company</label>
                  <select required name="internalCompany" defaultValue={editingRecord?.internalCompany || INTERNAL_COMPANIES[0]} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/30 text-sm font-bold">
                    {INTERNAL_COMPANIES.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment Description</label>
                  <input required name="description" defaultValue={editingRecord?.description} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="e.g. SFRA Test Kit" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial Number</label>
                  <input required name="serialNumber" defaultValue={editingRecord?.serialNumber} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" placeholder="S/N-X000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rental Vendor</label>
                  <select name="rentalCompany" defaultValue={editingRecord?.rentalCompany} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
                    {contracts.map(c => <option key={c.id} value={c.companyName}>{c.companyName}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate (SAR)</label>
                  <div className="relative">
                    <input required type="number" name="rateValue" defaultValue={editingRecord?.rateValue} className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">SAR</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate Type</label>
                  <select name="rateType" defaultValue={editingRecord?.rateType || 'Daily'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kit Received</label>
                  <input required type="date" name="kitReceivedDate" defaultValue={editingRecord?.kitReceivedDate} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calibration Due</label>
                  <input required type="date" name="calibrationDueDate" defaultValue={editingRecord?.calibrationDueDate} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Approval Status</label>
                  <select name="approvalStatus" defaultValue={editingRecord?.approvalStatus || 'N/A'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold bg-white">
                    {APPROVAL_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.code} - {opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice No.</label>
                  <input name="invoiceNumber" defaultValue={editingRecord?.invoiceNumber} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="INV-XXXX" />
                </div>
              </div>

              {/* Attachments Section (Sidebar in Modal) */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col h-full min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <FolderOpen size={14} className="text-blue-500" />
                    Documents List
                  </h4>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{modalAttachments.length} Files</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                  {modalAttachments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-xl opacity-60">
                      <FolderOpen size={32} className="text-gray-300 mb-2" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase">No documents attached yet</p>
                    </div>
                  ) : (
                    modalAttachments.map(att => (
                      <div key={att.id} className="bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-between group">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1.5 rounded-md ${
                            att.category === 'Invoice' ? 'bg-blue-50 text-blue-600' :
                            att.category === 'Receipt' ? 'bg-green-50 text-green-600' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {att.category === 'Invoice' ? <FileText size={14} /> : 
                             att.category === 'Receipt' ? <Receipt size={14} /> : <FolderOpen size={14} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold truncate text-gray-800">{att.name}</p>
                            <p className="text-[8px] font-black uppercase text-gray-400">{att.category}</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Quick Add Files</p>
                  <div className="grid grid-cols-2 gap-2">
                    <UploadButton label="Invoice" category="Invoice" onUpload={handleFileUpload} color="blue" />
                    <UploadButton label="Receipt" category="Receipt" onUpload={handleFileUpload} color="green" />
                    <UploadButton label="Other" category="Other" onUpload={handleFileUpload} color="gray" className="col-span-2" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 flex justify-end gap-3 pt-6 border-t mt-4">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm">Cancel</button>
                <button type="submit" className="px-10 py-2.5 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all text-sm uppercase tracking-widest">
                  {editingRecord ? 'Save Changes' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

const UploadButton: React.FC<{ 
  label: string; 
  category: Attachment['category']; 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, cat: Attachment['category']) => void;
  color: string;
  className?: string;
}> = ({ label, category, onUpload, color, className = "" }) => (
  <div className={`relative ${className}`}>
    <input 
      type="file" 
      multiple
      onChange={(e) => onUpload(e, category)} 
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
    />
    <div className={`w-full py-2 px-3 border border-dashed rounded-xl flex items-center justify-center gap-2 transition-all ${
      color === 'blue' ? 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400' :
      color === 'green' ? 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400' :
      'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
    }`}>
      <Upload size={12} />
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    </div>
  </div>
);

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/10' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
