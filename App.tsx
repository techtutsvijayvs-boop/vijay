
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Settings, LogOut, ChevronRight, X, Building2, Upload, FileText, CheckCircle2, MessageSquare, CreditCard, Receipt, FolderOpen, Trash2, Download, Plus, AlertTriangle, FileSpreadsheet, Search, CheckCircle, ArrowRight, Calendar, ShieldCheck, Truck, Layers, Filter, Sparkles, Star, ThumbsUp, Settings as SettingsIcon, ClipboardCheck, Globe, Users, Mail, MessageCircle, Lock, Unlock, Zap, Sun, Moon, Briefcase } from 'lucide-react';
import { EquipmentRecord, RentalContract, RateType, ApprovalStatus, Attachment, OwnershipType, ContactEntry } from './types';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import ContractMaster from './components/ContractMaster';
import DocumentsView from './components/DocumentsView';
import ContactDirectory from './components/ContactDirectory';
import SettingsView from './components/SettingsView';
import { InvoiceSummary, CalibrationSummary } from './components/SummaryViews';
import { parseExcelToEquipment } from './utils/excel';
import { format, isValid } from 'date-fns';

const safeFormatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, 'MMM dd, yyyy') : 'Invalid Date';
};

const INTERNAL_COMPANIES = [
  'DIGITAL ENERGY - DAMMAM',
  'SEP - JEDDAH',
  'KANOO - JEDDAH',
  'KLASS N TRENDS',
  'ENERGY DISTRIBUTOR LAP',
  'ALPHA BUILD LTD',
  'TITANS TRADING',
  'MEGGER',
  'MUWALYH SITE OFFICE'
];

const INITIAL_RECORDS: EquipmentRecord[] = [
  {
    id: 'rec_1',
    slNo: 1,
    description: 'Freja Relay kit',
    serialNumber: '24121089/1201538',
    unit: 'set',
    qty: 1,
    ownershipType: 'Rental',
    internalCompany: 'DIGITAL ENERGY - DAMMAM',
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
  }
];

// Official TG Brand Logo - Glossy App Icon Style
const BrandLogo = ({ className, withBg = false }: { className?: string; withBg?: boolean }) => (
  <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo_grad_green" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8CC63F" />
        <stop offset="100%" stopColor="#39B54A" />
      </linearGradient>
      <linearGradient id="logo_grad_blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00AEEF" />
        <stop offset="100%" stopColor="#0054A6" />
      </linearGradient>
      {/* Background Gradient: Top-Left Blue -> Bottom-Right Green */}
      <linearGradient id="logo_bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00AEEF" />
        <stop offset="100%" stopColor="#8CC63F" />
      </linearGradient>
      
      <filter id="logo_drop_shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.3" />
      </filter>

      <filter id="inner_glow">
         <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
         <feComposite in="blur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
         <feFlood floodColor="white" floodOpacity="0.7"/>
         <feComposite in2="shadowDiff" operator="in"/>
         <feComposite in2="SourceGraphic" operator="over" result="firstfilter"/>
      </filter>
      
      {/* Glass Gloss Gradient */}
      <linearGradient id="gloss_grad" x1="50%" y1="0%" x2="50%" y2="100%">
         <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
         <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
    
    {/* Background Container for App Icon Style */}
    {withBg && (
       <g filter="url(#logo_drop_shadow)">
         <rect width="512" height="512" rx="120" fill="url(#logo_bg_grad)" />
         
         {/* Top Gloss Highlight */}
         <path 
            d="M 20 160 Q 256 60 492 160 Q 492 40 452 20 H 60 Q 20 20 20 160" 
            fill="url(#gloss_grad)" 
         />
       </g>
    )}
    
    {/* TG Symbol - Scaled to fit Safe Zone */}
    <g transform={withBg ? "translate(56, 56) scale(0.78)" : "translate(26, 26) scale(0.9)"}>
        {/* Outer White Stroke for Distinctness */}
        <path 
           d="M50 50 H462 L256 462 L50 50" 
           fill="none" 
           stroke="white" 
           strokeWidth="35" 
           strokeLinejoin="round" 
           strokeLinecap="round"
           filter={!withBg ? "url(#logo_drop_shadow)" : ""}
        />
        
        {/* Green Top Shape */}
        <path 
           d="M50 50 H462 L400 120 H300 L250 250 L150 120 H100 L50 50" 
           fill="url(#logo_grad_green)" 
           filter="url(#inner_glow)"
        />
        
        {/* Blue Bottom Shape */}
        <path 
           d="M256 462 L380 180 L320 180 L256 300 L190 180 L130 180 L256 462" 
           fill="url(#logo_grad_blue)" 
           filter="url(#inner_glow)"
        />
    </g>
  </svg>
);

// Premium Gold Badge Component
const PremiumBadge = () => (
  <div className="relative w-44 h-44 flex items-center justify-center drop-shadow-2xl hover:scale-105 transition-transform duration-500">
     {/* Ribbons */}
     <div className="absolute top-[80%] -left-6 w-28 h-10 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-600 transform -rotate-[20deg] -z-10 shadow-lg clip-ribbon-left flex items-center justify-center"></div>
     <div className="absolute top-[80%] -right-6 w-28 h-10 bg-gradient-to-l from-yellow-700 via-yellow-500 to-yellow-600 transform rotate-[20deg] -z-10 shadow-lg clip-ribbon-right"></div>
     
     {/* Starburst Seal */}
     <div className="w-full h-full bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 rounded-full flex items-center justify-center p-1.5 shadow-xl">
        {/* Inner Dark Circle */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-900 to-green-800 border-2 border-yellow-300 border-dashed shadow-inner flex flex-col items-center justify-center text-center px-2">
            <div className="flex gap-1 mb-1">
                 {[1,2,3,4,5].map(i => <Star key={i} size={8} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="text-yellow-100 text-[9px] font-bold tracking-[0.2em] uppercase">Guaranteed</span>
            <span className="text-white text-xl font-black uppercase tracking-tighter leading-none drop-shadow-md my-1">Premium</span>
            <span className="text-yellow-400 text-lg font-black uppercase tracking-widest leading-none">Quality</span>
            <div className="flex gap-1 mt-2">
                 {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-yellow-400"></div>)}
            </div>
        </div>
     </div>
  </div>
);

// Redesigned Industrial Banner
const AppBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  return (
    <div className={`relative w-full overflow-hidden bg-slate-900 shadow-2xl transition-all duration-700 group ${compact ? 'h-48 rounded-3xl mb-6' : 'h-[300px] md:h-[380px] rounded-[48px] mb-10'}`}>
      
      {/* 1. Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* Using a high-quality industrial worker image */}
        <img 
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
          alt="Testing & Commissioning Technician" 
          className="w-full h-full object-cover object-right-top opacity-100"
        />
        
        {/* 2. Gradient Overlay: Green (Left) -> Transparent (Center) -> Blue (Right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80] via-[#4ade80]/60 to-[#2563eb]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] via-transparent to-[#1e40af] opacity-80"></div>
        
        {/* 3. Tech Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* 4. Bottom Swoosh Decoration */}
      <svg className="absolute bottom-0 left-0 w-full h-16 md:h-24 z-10 pointer-events-none opacity-90" preserveAspectRatio="none" viewBox="0 0 1440 320">
         <path fill="#0054A6" fillOpacity="1" d="M0,256L48,261.3C96,267,192,277,288,261.3C384,245,480,203,576,202.7C672,203,768,245,864,250.7C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         <path fill="#00AEEF" fillOpacity="0.5" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>

      {/* 5. Content Layout */}
      <div className="relative z-20 h-full flex flex-col md:flex-row items-center justify-between px-6 lg:px-16 py-8 md:py-12 gap-4">
         
         {/* Left: Branding & Arabic */}
         <div className="flex items-center gap-6 flex-shrink-0 z-30">
             {/* Glossy Logo */}
             <div className="transform group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl">
                 <BrandLogo 
                    className={`${compact ? 'w-24 h-24' : 'w-32 h-32 md:w-44 md:h-44'}`} 
                    withBg={true} 
                 />
             </div>
             
             {/* Text Block */}
             <div className="flex flex-col items-start drop-shadow-lg">
                 {!compact && (
                   <div className="text-[#8CC63F] font-bold text-xl md:text-3xl font-arabic tracking-wide mb-1 text-right w-full leading-none" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                     تـران جـي
                   </div>
                 )}
                 <div className="flex flex-col leading-none">
                    <span className={`${compact ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black text-white tracking-tighter`}>
                        TRAN JI
                    </span>
                 </div>
                 {!compact && (
                     <div className="mt-2 flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-[0.2em]">
                         <Globe size={14} className="text-[#00AEEF]" />
                         <span>Global Solutions</span>
                     </div>
                 )}
             </div>
         </div>

         {/* Center: Gold Premium Badge (Absolute positioning for floating effect) */}
         {!compact && (
            <div className="hidden xl:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 animate-slideUp" style={{ animationDelay: '0.2s' }}>
               <PremiumBadge />
            </div>
         )}

         {/* Right: Commissioning Title */}
         <div className="flex flex-col items-center md:items-end text-center md:text-right z-30 mt-auto md:mt-0 mb-4 md:mb-8 drop-shadow-2xl">
             <h1 className={`${compact ? 'text-2xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-black text-white tracking-tight leading-[0.9] uppercase`}>
                 Testing &
             </h1>
             <h1 className={`${compact ? 'text-2xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-black text-[#8CC63F] tracking-tight leading-[0.9] uppercase`}>
                 Commissioning
             </h1>
             {!compact && (
                 <div className="mt-4 flex gap-3">
                     <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                        Rental
                     </span>
                     <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                        Calibration
                     </span>
                     <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                        Asset Mgmt
                     </span>
                 </div>
             )}
         </div>
      </div>
      
      <style>{`
        .clip-ribbon-left { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 20% 50%); }
        .clip-ribbon-right { clip-path: polygon(0 0, 100% 0, 80% 50%, 100% 100%, 0 100%); }
        @font-face {
          font-family: 'ArabicFont';
          src: local('Arial'), local('Tahoma');
        }
        .font-arabic { font-family: 'ArabicFont', sans-serif; }
      `}</style>
    </div>
  );
};

// Global Support/Contact Widget
const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
       {isOpen && (
         <div className="flex flex-col gap-3 pointer-events-auto animate-slideUp">
            <a 
              href="mailto:support@trange.sa" 
              className="flex items-center gap-3 bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 px-5 py-3 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all group"
            >
              <div className="text-right">
                <span className="block text-xs font-black uppercase tracking-widest">Email Support</span>
                <span className="block text-[9px] text-slate-400 font-bold">via Outlook/System</span>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full group-hover:scale-110 transition-transform">
                 <Mail size={18} />
              </div>
            </a>
            <a 
              href="https://wa.me/966500000000" // Placeholder for general support
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 px-5 py-3 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all group"
            >
              <div className="text-right">
                 <span className="block text-xs font-black uppercase tracking-widest">Chat on WhatsApp</span>
                 <span className="block text-[9px] text-slate-400 font-bold">Direct Message</span>
              </div>
              <div className="p-2 bg-[#25D366]/20 text-[#25D366] rounded-full group-hover:scale-110 transition-transform">
                 <MessageCircle size={18} />
              </div>
            </a>
         </div>
       )}
       
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="pointer-events-auto w-16 h-16 bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white rounded-full shadow-2xl shadow-blue-600/30 dark:shadow-green-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-4 border-white dark:border-gray-800"
       >
         {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
       </button>
    </div>
  );
};

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'selection' | 'main'>('selection');
  const [activeFilter, setActiveFilter] = useState<OwnershipType | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'contracts' | 'invoices' | 'calibration' | 'documents' | 'directory' | 'settings'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
  });

  const [records, setRecords] = useState<EquipmentRecord[]>([]);
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  
  const [isAdmin, setIsAdmin] = useState(false); // New Admin State
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EquipmentRecord | null>(null);
  const [importPreview, setImportPreview] = useState<EquipmentRecord[] | null>(null);
  const [importSearch, setImportSearch] = useState('');
  const [importBatchOwnership, setImportBatchOwnership] = useState<OwnershipType>('Rental');
  
  const [modalAttachments, setModalAttachments] = useState<Attachment[]>([]);
  
  useEffect(() => {
    const savedRecords = localStorage.getItem('equip_records');
    const savedContracts = localStorage.getItem('equip_contracts');
    const savedContacts = localStorage.getItem('equip_contacts_directory');
    
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

    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const saveToStorage = (newRecords: EquipmentRecord[]) => {
    localStorage.setItem('equip_records', JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const saveContacts = (newContacts: ContactEntry[]) => {
    localStorage.setItem('equip_contacts_directory', JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  const filteredRecords = records.filter(r => 
    activeFilter === 'All' || r.ownershipType === activeFilter
  );

  const startApp = (filter: OwnershipType | 'All') => {
    setActiveFilter(filter);
    setImportBatchOwnership(filter === 'All' ? 'Rental' : filter);
    setAppMode('main');
  };

  const handleExcelImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result;
      if (buffer instanceof ArrayBuffer) {
        const parsed = parseExcelToEquipment(buffer);
        if (activeFilter !== 'All') {
          setImportBatchOwnership(activeFilter);
        }
        setImportPreview(parsed);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const importSingleItem = (item: EquipmentRecord) => {
    const finalItem = { ...item, ownershipType: importBatchOwnership };
    const existingIdx = records.findIndex(r => r.serialNumber === finalItem.serialNumber);
    let newRecords = [...records];
    
    if (existingIdx !== -1) {
      newRecords[existingIdx] = { ...newRecords[existingIdx], ...finalItem, id: newRecords[existingIdx].id };
    } else {
      newRecords.push({ ...finalItem, id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, slNo: records.length + 1 });
    }
    
    saveToStorage(newRecords);
  };

  const importAllPreview = () => {
    if (!importPreview) return;
    const updatedRecords = [...records];
    importPreview.forEach(newItem => {
      const finalItem = { ...newItem, ownershipType: importBatchOwnership };
      const existingIdx = updatedRecords.findIndex(r => r.serialNumber === finalItem.serialNumber);
      if (existingIdx !== -1) {
        updatedRecords[existingIdx] = { ...updatedRecords[existingIdx], ...finalItem, id: updatedRecords[existingIdx].id };
      } else {
        updatedRecords.push({ 
          ...finalItem, 
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          slNo: updatedRecords.length + 1
        });
      }
    });
    saveToStorage(updatedRecords);
    setImportPreview(null);
  };

  const handleAddEdit = (formData: any) => {
    const claimMonth = formData.kitReceivedDate ? format(new Date(formData.kitReceivedDate), 'MMMM yyyy') : format(new Date(), 'MMMM yyyy');
    
    if (formData.ownershipType === 'Own' && !formData.rentalCompany) {
      formData.rentalCompany = formData.internalCompany;
    }

    if (editingRecord) {
      const updated = records.map(r => r.id === editingRecord.id ? { 
        ...r, 
        ...formData,
        claimMonth,
        attachments: modalAttachments
      } : r);
      saveToStorage(updated);
    } else {
      const newRecord: EquipmentRecord = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        slNo: records.length + 1,
        claimMonth,
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

  const filteredImportItems = importPreview?.filter(item => 
    item.description.toLowerCase().includes(importSearch.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(importSearch.toLowerCase())
  );

  // Selection Screen JSX
  if (appMode === 'selection') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center p-6 relative overflow-hidden font-jakarta">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl w-full relative z-10 flex flex-col items-center">
          {/* Brand Banner */}
          <AppBanner />

          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight animate-slideUp">
              System Gateway
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Welcome to the inventory management portal. Please select your workspace to proceed with focused tracking and monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4 mb-20">
            <button 
              onClick={() => startApp('Own')}
              className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-12 rounded-[56px] text-left hover:border-emerald-500 transition-all duration-700 hover:-translate-y-4 shadow-xl hover:shadow-emerald-500/10 overflow-hidden animate-slideUp"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12 group-hover:rotate-6 scale-125">
                <ShieldCheck size={320} className="text-emerald-600 dark:text-emerald-500" />
              </div>
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-[32px] flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-10 border border-emerald-100 dark:border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-700 shadow-lg">
                <ShieldCheck size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">Own Assets</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                  Monitor company-owned hardware, calibration cycles, and site deployments.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-3 text-emerald-600 dark:text-emerald-500 font-black uppercase text-sm tracking-[0.2em] group-hover:translate-x-4 transition-transform duration-500">
                Open Module <ArrowRight size={20} />
              </div>
            </button>

            <button 
              onClick={() => startApp('Rental')}
              className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-12 rounded-[56px] text-left hover:border-blue-500 transition-all duration-700 hover:-translate-y-4 shadow-xl hover:shadow-blue-500/10 overflow-hidden animate-slideUp"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 -rotate-12 group-hover:-rotate-6 scale-125">
                <Truck size={320} className="text-blue-600 dark:text-blue-500" />
              </div>
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-[32px] flex items-center justify-center text-blue-600 dark:text-blue-500 mb-10 border border-blue-100 dark:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 shadow-lg">
                <Truck size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">Rental Tracking</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                  Track vendor kits, daily cost accruals, and monthly financial claims.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-3 text-blue-600 dark:text-blue-500 font-black uppercase text-sm tracking-[0.2em] group-hover:translate-x-4 transition-transform duration-500">
                Open Module <ArrowRight size={20} />
              </div>
            </button>
          </div>

          <button 
            onClick={() => startApp('All')}
            className="group text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-3 bg-white dark:bg-slate-800 px-8 py-4 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 animate-slideUp"
            style={{ animationDelay: '0.4s' }}
          >
            <Layers size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            Combined Enterprise View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-jakarta transition-colors duration-500 bg-slate-50 dark:bg-slate-900`}>
      {/* Floating Support Button */}
      <SupportWidget />

      <nav className="w-full lg:w-64 bg-[#0F172A] text-white flex-shrink-0 z-20 shadow-xl relative">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 p-0.5">
               <BrandLogo className="w-full h-full" withBg={true} />
             </div>
             <div>
                <div className="text-xl font-black tracking-tighter">TRAN JI</div>
                <div className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: '#00ff00' }}>Expert</div>
             </div>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-11">Resource Manager</p>
        </div>
        
        <div className="px-4 py-6">
          <div className="bg-slate-800/50 rounded-2xl p-1.5 border border-slate-700 flex flex-col gap-1">
             <button 
               onClick={() => { setActiveFilter('Own'); setImportBatchOwnership('Own'); }}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                 activeFilter === 'Own' ? 'bg-[#00ff00] text-black shadow-lg shadow-[#00ff00]/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
               }`}
             >
               <ShieldCheck size={14} />
               Own Module
             </button>
             <button 
               onClick={() => { setActiveFilter('Rental'); setImportBatchOwnership('Rental'); }}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                 activeFilter === 'Rental' ? 'bg-blue-600 dark:bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
               }`}
             >
               <Truck size={14} />
               Rental Module
             </button>
          </div>
        </div>

        <div className="px-4 py-2 space-y-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Menu size={18} />} label="Dashboard" />
          <NavItem active={activeTab === 'register'} onClick={() => setActiveTab('register')} icon={<ChevronRight size={18} />} label="Register" />
          {/* Updated Contract Master with Briefcase Icon */}
          <NavItem active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} icon={<Briefcase size={18} />} label="Contracts" />
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-800 mt-4">Management</div>
          <NavItem active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} icon={<FileText size={18} />} label="Redemptions" />
          <NavItem active={activeTab === 'calibration'} onClick={() => setActiveTab('calibration')} icon={<CheckCircle2 size={18} />} label="Calibration" />
          <NavItem active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FolderOpen size={18} />} label="Doc Vault" />
          <NavItem active={activeTab === 'directory'} onClick={() => setActiveTab('directory')} icon={<Users size={18} />} label="Directory" />
          
          {/* New Settings Item */}
          <div className="mt-4">
             <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={18} />} label="Settings" />
          </div>

          {/* Admin & Theme Toggle */}
          <div className="mt-8 px-4 space-y-3">
            <div className={`p-1 rounded-2xl border transition-all duration-300 ${isAdmin ? 'bg-emerald-900/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-slate-800 border-slate-700'}`}>
                <button
                   onClick={() => setIsAdmin(!isAdmin)}
                   className="w-full flex items-center justify-between px-3 py-3"
                >
                   <div className="flex items-center gap-3">
                      {isAdmin ? <Unlock size={16} className="text-emerald-400" /> : <Lock size={16} className="text-slate-500" />}
                      <span className={`text-xs font-black uppercase tracking-widest ${isAdmin ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {isAdmin ? 'Admin Active' : 'User View'}
                      </span>
                   </div>
                   <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isAdmin ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] scale-125' : 'bg-slate-600'}`}></div>
                </button>
            </div>
            
            <button
               onClick={toggleTheme}
               className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
               <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon size={16} className="text-sky-400" /> : <Sun size={16} className="text-amber-400" />}
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
               </div>
               <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-sky-500' : 'bg-slate-600'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
               </div>
            </button>
          </div>

          <div className="mt-4 px-4 pb-8">
             <button 
               onClick={() => setAppMode('selection')}
               className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-red-500/10 transition-all border border-slate-700 hover:border-red-500/20"
             >
               <LogOut size={16} />
               Exit Module
             </button>
          </div>
        </div>
      </nav>

      <main className={`flex-1 p-4 lg:p-8 overflow-y-auto transition-colors duration-500 bg-slate-50 dark:bg-slate-900`}>
        {/* Compact Banner for Main Content Area */}
        <AppBanner compact />

        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                  activeFilter === 'Own' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                  activeFilter === 'Rental' ? 'bg-blue-500/10 dark:bg-green-500/10 text-blue-500 dark:text-green-500 border border-blue-500/20 dark:border-green-500/20' : 
                  'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {activeFilter}
                </span>
                <ChevronRight size={12} className="text-slate-300" />
                <h2 className={`text-3xl font-black capitalize tracking-tight text-slate-900 dark:text-white`}>{activeTab.replace('-', ' ')}</h2>
              </div>
              <p className={`text-sm font-medium text-slate-500 dark:text-slate-400`}>Testing & Commissioning Resource Center</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => openModal()}
              className="px-6 py-3 bg-slate-900 dark:bg-green-600 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-slate-200 dark:shadow-green-900/20 hover:bg-black dark:hover:bg-green-700 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <Plus size={16} />
              Manual Entry
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && <Dashboard records={filteredRecords} mode={activeFilter} />}
          {activeTab === 'register' && (
            <EquipmentTable 
              records={filteredRecords} 
              onAdd={() => openModal()} 
              onEdit={(r) => openModal(r)}
              onDelete={handleDelete}
              onQuickUpload={(r) => openModal(r)}
              onExcelImport={handleExcelImport}
              isAdmin={isAdmin}
              onUpdateRecord={(updated) => {
                 const newRecords = records.map(r => r.id === updated.id ? updated : r);
                 saveToStorage(newRecords);
              }}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractMaster 
              contracts={contracts} 
              onAdd={() => {}} 
              onDelete={(id) => setContracts(contracts.filter(c => c.id !== id))} 
            />
          )}
          {activeTab === 'invoices' && <InvoiceSummary records={filteredRecords} />}
          {activeTab === 'calibration' && <CalibrationSummary records={filteredRecords} onUpdateRecord={(r) => {
            const updated = records.map(old => old.id === r.id ? r : old);
            saveToStorage(updated);
          }} />}
          {activeTab === 'documents' && (
            <DocumentsView 
              records={filteredRecords} 
              onUploadRequest={(r) => openModal(r)}
            />
          )}
          {activeTab === 'directory' && (
            <ContactDirectory 
              contacts={contacts}
              onAdd={(contactData) => {
                const newContact: ContactEntry = {
                  ...contactData,
                  id: Math.random().toString(36).substr(2, 9)
                };
                saveContacts([...contacts, newContact]);
              }}
              onDelete={(id) => {
                if (window.confirm('Are you sure you want to remove this contact?')) {
                  saveContacts(contacts.filter(c => c.id !== id));
                }
              }}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView 
              isAdmin={isAdmin} 
              currentTheme={theme} 
              onThemeToggle={toggleTheme} 
            />
          )}
        </div>
      </main>

      {/* Modern Excel Staging Modal */}
      {importPreview && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl w-full max-w-6xl overflow-hidden animate-slideUp border border-white/20 dark:border-gray-800">
            <div className="p-8 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between bg-slate-50/80 dark:bg-gray-900/80">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-600 rounded-[24px] text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                  <FileSpreadsheet size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Excel Smart Staging</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing {importPreview.length} potential records</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-200/50 dark:bg-gray-800 p-1.5 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <span className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase px-3">Import as:</span>
                  <button 
                    onClick={() => setImportBatchOwnership('Rental')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                      importBatchOwnership === 'Rental' ? 'bg-blue-600 dark:bg-green-600 text-white shadow-lg' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Truck size={14} />
                    Rental
                  </button>
                  <button 
                    onClick={() => setImportBatchOwnership('Own')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                      importBatchOwnership === 'Own' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    Own
                  </button>
                </div>

                <div className="h-10 w-[1px] bg-slate-200 dark:bg-gray-700 mx-2"></div>

                <button 
                  onClick={importAllPreview}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Import All
                </button>
                <button onClick={() => setImportPreview(null)} className="p-3 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-2xl transition-all">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-8 flex flex-col gap-6 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search within Excel file..." 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[20px] focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900 dark:text-white"
                      value={importSearch}
                      onChange={(e) => setImportSearch(e.target.value)}
                    />
                 </div>
              </div>

              <div className="overflow-y-auto max-h-[50vh] rounded-[24px] border border-slate-100 dark:border-gray-800 scrollbar-thin">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 sticky top-0 z-10">
                    <tr>
                      <th className="py-5 px-6">Sl</th>
                      <th className="py-5 px-6">Equipment Info</th>
                      <th className="py-5 px-6 text-center">Batch Ownership</th>
                      <th className="py-5 px-6">Rental Terms</th>
                      <th className="py-5 px-6">Calibration</th>
                      <th className="py-5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                    {filteredImportItems?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center font-bold text-slate-300 dark:text-gray-600">No matches found in Excel data.</td>
                      </tr>
                    ) : (
                      filteredImportItems?.map((item, i) => {
                        const isAdded = records.some(r => r.serialNumber === item.serialNumber);
                        return (
                          <tr key={i} className={`hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors ${isAdded ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : ''}`}>
                            <td className="py-4 px-6 font-mono font-bold text-slate-400">#{item.slNo}</td>
                            <td className="py-4 px-6">
                              <div className="font-black text-slate-900 dark:text-gray-100 leading-tight">{item.description}</div>
                              <div className="text-[10px] font-mono text-indigo-500 mt-1 uppercase">S/N: {item.serialNumber}</div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                                importBatchOwnership === 'Own' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                                  : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                              }`}>
                                {importBatchOwnership}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-black text-slate-900 dark:text-gray-100">⃁ {item.rateValue}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">per {item.rateType}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Expires:</div>
                              <div className="text-xs font-black text-slate-600 dark:text-gray-300">{safeFormatDate(item.calibrationDueDate)}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center">
                                <button 
                                  onClick={() => importSingleItem(item)}
                                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isAdded 
                                      ? 'bg-slate-100 text-slate-400 cursor-default dark:bg-gray-800 dark:text-gray-600' 
                                      : 'bg-slate-900 dark:bg-green-600 text-white hover:bg-indigo-600 dark:hover:bg-green-700 shadow-lg shadow-slate-200 dark:shadow-none'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <CheckCircle size={14} className="text-emerald-500" />
                                      Sync'd
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight size={14} />
                                      Add to Register
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-8 bg-slate-50/80 dark:bg-gray-900/80 border-t border-slate-100 dark:border-gray-800 flex justify-end items-center gap-6">
                <button 
                  onClick={() => setImportPreview(null)} 
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 dark:text-gray-400 dark:hover:bg-gray-800 transition-all text-sm uppercase tracking-widest"
                >
                  Close Staging
                </button>
                <button 
                  onClick={() => {
                      importAllPreview();
                      setActiveTab('register');
                  }}
                  className="px-12 py-4 rounded-[20px] font-black bg-slate-900 dark:bg-green-600 text-white hover:bg-indigo-600 dark:hover:bg-green-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all text-sm uppercase tracking-widest flex items-center gap-3"
                >
                  Confirm Import Batch
                  <ChevronRight size={18} />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl w-full max-w-5xl overflow-hidden animate-slideUp border border-white/20 dark:border-gray-700">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-black flex items-center gap-4 text-gray-900 dark:text-white">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-[18px] text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-50 dark:shadow-none">
                  <Building2 size={24} />
                </div>
                {editingRecord ? `Update Entry` : 'Create New Equipment Record'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10 overflow-y-auto max-h-[80vh]" onSubmit={(e) => {
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
              <div className="lg:col-span-2 space-y-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment Category</label>
                  <div className="flex bg-slate-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
                    <label className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      (editingRecord?.ownershipType || activeFilter) === 'Own' ? 'bg-white dark:bg-gray-700 text-slate-400' : 'bg-blue-600 dark:bg-green-600 text-white shadow-lg'
                    }`}>
                      <input type="radio" name="ownershipType" value="Rental" defaultChecked={(editingRecord?.ownershipType || activeFilter) !== 'Own'} className="hidden" />
                      <Truck size={14} />
                      Rental Equipment
                    </label>
                    <label className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      (editingRecord?.ownershipType || activeFilter) === 'Own' ? 'bg-[#00ff00] text-black shadow-lg shadow-[#00ff00]/10' : 'bg-white dark:bg-gray-700 text-slate-400'
                    }`}>
                      <input type="radio" name="ownershipType" value="Own" defaultChecked={(editingRecord?.ownershipType || activeFilter) === 'Own'} className="hidden" />
                      <ShieldCheck size={14} />
                      Own Equipment
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Entity</label>
                    <select required name="internalCompany" defaultValue={editingRecord?.internalCompany || INTERNAL_COMPANIES[0]} className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-[18px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-green-900 outline-none bg-blue-50/30 dark:bg-gray-800 text-sm font-black dark:text-white">
                      {INTERNAL_COMPANIES.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment Description</label>
                    <input required name="description" defaultValue={editingRecord?.description} className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-[18px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-green-900 outline-none text-sm font-bold bg-white dark:bg-gray-800 dark:text-white" placeholder="e.g. SFRA Test Kit" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial Number</label>
                    <input required name="serialNumber" defaultValue={editingRecord?.serialNumber} className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-[18px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-green-900 outline-none font-mono text-sm font-black bg-white dark:bg-gray-800 dark:text-white" placeholder="S/N-X000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rental Cost (SAR)</label>
                    <input required type="number" name="rateValue" defaultValue={editingRecord?.rateValue} className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-[18px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-green-900 outline-none font-black text-sm bg-white dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-gray-800 p-8 rounded-[32px] border border-slate-100 dark:border-gray-700 space-y-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-slate-400" size={20} />
                        <h4 className="text-[11px] font-black text-slate-800 dark:text-gray-200 uppercase tracking-widest">Project Timeline</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Date</label>
                            <input required type="date" name="kitReceivedDate" defaultValue={editingRecord?.kitReceivedDate} className="w-full px-5 py-4 border border-slate-200 dark:border-gray-600 rounded-[18px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-green-900 outline-none text-sm font-bold bg-white dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calibration Due</label>
                            <input required type="date" name="calibrationDueDate" defaultValue={editingRecord?.calibrationDueDate} className="w-full px-5 py-4 border border-slate-200 dark:border-gray-600 rounded-[18px] focus:ring-4 focus:ring-blue-100 dark:focus:ring-green-900 outline-none text-sm font-bold bg-white dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <FolderOpen size={18} className="text-blue-500 dark:text-green-500" />
                    Record Docs
                  </h4>
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">{modalAttachments.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1 custom-scrollbar">
                  {modalAttachments.map(att => (
                    <div key={att.id} className="bg-white dark:bg-gray-700 p-3 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-between group hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate text-gray-800 dark:text-gray-200" title={att.name}>{att.name}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeAttachment(att.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <UploadButton label="Invoice" category="Invoice" onUpload={handleFileUpload} color="blue" />
                  <UploadButton label="Cert" category="Certificate" onUpload={handleFileUpload} color="purple" />
                </div>
              </div>

              <div className="lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button type="button" onClick={closeModal} className="px-8 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">Cancel</button>
                <button type="submit" className="px-12 py-3 rounded-xl font-black bg-blue-600 dark:bg-green-600 text-white hover:bg-blue-700 dark:hover:bg-green-700 shadow-xl shadow-blue-500/20 dark:shadow-green-600/20 transition-all text-sm uppercase tracking-widest">
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @font-face {
          font-family: 'ArabicFont';
          src: local('Arial'), local('Tahoma');
        }
        .font-arabic { font-family: 'ArabicFont', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

// Helper component for document uploads in the modal
const UploadButton: React.FC<{ 
  label: string; 
  category: Attachment['category']; 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, category: Attachment['category']) => void; 
  color: 'blue' | 'purple'; 
}> = ({ label, category, onUpload, color }) => {
  const colorClass = color === 'blue' 
    ? 'border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-600 hover:border-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' 
    : 'border-purple-100 bg-purple-50/50 hover:bg-purple-50 text-purple-600 hover:border-purple-400 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
  
  return (
    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${colorClass}`}>
      <Upload size={18} className="mb-1" />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      <input type="file" className="hidden" multiple onChange={(e) => onUpload(e, category)} />
    </label>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active ? 'bg-blue-600 dark:bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
