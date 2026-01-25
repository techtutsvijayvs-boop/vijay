
import React, { useState } from 'react';
import { ContactEntry } from '../types';
import { Plus, Trash2, Search, Phone, Mail, MapPin, Building2, User, Send, X, AlertCircle, ExternalLink } from 'lucide-react';

interface ContactDirectoryProps {
  contacts: ContactEntry[];
  onAdd: (contact: Omit<ContactEntry, 'id'>) => void;
  onDelete: (id: string) => void;
}

const ContactDirectory: React.FC<ContactDirectoryProps> = ({ contacts, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWhatsApp = (number: string) => {
    // Keep only digits for the API
    const cleanNum = number.replace(/[^\d]/g, '');
    if (cleanNum.length < 5) {
      alert("Invalid phone number format for WhatsApp");
      return;
    }
    window.open(`https://wa.me/${cleanNum}`, '_blank');
  };

  const handleEmail = (email: string) => {
    // Primary: Standard Mailto (Opens system default, usually Outlook app)
    window.open(`mailto:${email}`, '_blank');
  };
  
  const handleOutlookWeb = (email: string) => {
    // Secondary: Direct Office 365 / Outlook Web Deep Link
    window.open(`https://outlook.office.com/mail/deeplink/compose?to=${email}`, '_blank');
  };

  const validateAndSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const email = formData.get('email') as string;
    const companyName = formData.get('companyName') as string;
    const location = formData.get('location') as string;

    // 1. Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // 2. Phone Validation (Allowing international format +, space, -)
    const cleanPhone = contactNumber.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 16) {
      setError("Please enter a valid numeric contact number (min 7 digits).");
      return;
    }

    onAdd({
      name,
      contactNumber,
      email,
      companyName,
      location
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contact Directory</h2>
           <p className="text-sm text-slate-500 font-medium">Manage vendors, site engineers, and internal stakeholders.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search directory..."
              className="w-full md:w-64 pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
           <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <User size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">No contacts found.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Add your first contact</button>
           </div>
        ) : (
          filtered.map(contact => (
            <div key={contact.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                     <User size={24} />
                  </div>
                  <button onClick={() => onDelete(contact.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                     <Trash2 size={16} />
                  </button>
               </div>

               <div className="mb-6 flex-grow">
                  <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{contact.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                     <Building2 size={12} />
                     <span className="truncate">{contact.companyName}</span>
                  </div>
               </div>

               <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                     <Phone size={14} className="text-slate-400" />
                     <span className="truncate font-mono">{contact.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                     <Mail size={14} className="text-slate-400" />
                     <span className="truncate" title={contact.email}>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                     <MapPin size={14} className="text-slate-400" />
                     <span className="truncate">{contact.location}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-2 mt-auto">
                  <button 
                    onClick={() => handleWhatsApp(contact.contactNumber)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-black text-[10px] uppercase tracking-wider hover:bg-[#25D366] hover:text-white transition-all shadow-sm hover:shadow-md"
                  >
                     <Send size={14} /> WhatsApp
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => handleEmail(contact.email)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                    >
                        <Mail size={14} /> Outlook
                    </button>
                    <button 
                        onClick={() => handleOutlookWeb(contact.email)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-wider hover:bg-slate-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        title="Open in Office 365 Web"
                    >
                        <ExternalLink size={14} /> Web App
                    </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-slideUp border border-white/20">
              <div className="p-8 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900">Add New Contact</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                 </button>
              </div>
              
              <form onSubmit={validateAndSubmit} className="p-8 space-y-6">
                 {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                       <AlertCircle size={16} />
                       {error}
                    </div>
                 )}

                 <div className="space-y-5">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name <span className="text-red-500">*</span></label>
                       <input required name="name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. John Doe" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone <span className="text-red-500">*</span></label>
                           <input required name="contactNumber" type="tel" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="+966 5X XXX XXXX" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email <span className="text-red-500">*</span></label>
                           <input required name="email" type="email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="name@company.com" />
                        </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Company Name <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                         <input required name="companyName" className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. Acme Industries Ltd." />
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                         <input required name="location" className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. Riyadh, KSA" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex gap-3 pt-4 border-t border-slate-50">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors text-xs uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="flex-1 py-4 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all text-xs uppercase tracking-widest">Save Contact</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ContactDirectory;
