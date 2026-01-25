
import React, { useState } from 'react';
import { EquipmentRecord, ApprovalStatus, AdminComment } from '../types';
import { X, ShieldCheck, MessageSquare, CheckCircle, AlertCircle, Clock, DollarSign, Calendar, Lock, ArrowDown, History } from 'lucide-react';

interface AdminInvoiceModalProps {
  record: EquipmentRecord;
  onSave: (updatedRecord: EquipmentRecord) => void;
  onClose: () => void;
}

const AdminInvoiceModal: React.FC<AdminInvoiceModalProps> = ({ record, onSave, onClose }) => {
  const [status, setStatus] = useState<ApprovalStatus>(record.approvalStatus || 'N/A');
  const [newComment, setNewComment] = useState('');
  const [isPaymentDone, setIsPaymentDone] = useState(record.isPaymentDone || false);
  const [paymentDate, setPaymentDate] = useState(record.paymentDate || new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const comments = record.adminComments || [];
  
  // Workflow Logic Checks
  const isApproved = status === 'A';
  const isRejected = status === 'R';
  const hasStatusChanged = status !== (record.approvalStatus || 'N/A');

  const handleSave = () => {
    setError(null);

    // 1. Mandatory Comment Rule
    if (hasStatusChanged && !newComment.trim()) {
      setError("Workflow Action Required: You must add a comment/justification to change the status.");
      return;
    }

    // 2. Payment Logic Rule
    if (isPaymentDone && !isApproved) {
      setError("Compliance Error: Payment can only be confirmed for records with 'Approved' status.");
      return;
    }

    const updatedComments = [...comments];
    if (newComment.trim()) {
      updatedComments.push({
        id: Date.now().toString(),
        text: newComment,
        author: 'Admin', // In a real app, this would be the logged-in user's name
        timestamp: new Date().toISOString()
      });
    }

    // Determine high-level workflow stage
    let stage: EquipmentRecord['workflowStage'] = 'Submitted';
    if (status === 'RE') stage = 'Under Review';
    if (status === 'R') stage = 'Rejected';
    if (status === 'A') stage = isPaymentDone ? 'Paid' : 'Approved';

    onSave({
      ...record,
      approvalStatus: status,
      workflowStage: stage,
      adminComments: updatedComments,
      isPaymentDone: isPaymentDone,
      paymentDate: isPaymentDone ? paymentDate : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-jakarta">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
        
        {/* Secure Admin Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Admin Control Panel</h3>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                 <span>Secure Environment</span>
                 <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                 <span>ID: {record.slNo}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 animate-fadeIn">
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* STAGE 1: DOCUMENT APPROVAL */}
          <section className="relative">
             <div className="absolute -left-3 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
             <div className="pl-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                   Document Approval
                </h4>
                
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { val: 'N/A', label: 'Pending', icon: Clock, color: 'bg-slate-100 text-slate-500 border-slate-200' },
                    { val: 'RE', label: 'Review', icon: AlertCircle, color: 'bg-orange-50 text-orange-600 border-orange-200' },
                    { val: 'A', label: 'Approve', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                    { val: 'R', label: 'Reject', icon: X, color: 'bg-red-50 text-red-600 border-red-200' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setStatus(opt.val as ApprovalStatus);
                        if (opt.val !== 'A') setIsPaymentDone(false); // Reset payment if not approved
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${
                        status === opt.val ? `border-current ring-2 ring-offset-1 ring-offset-white ${opt.color.replace('border-', 'ring-')}` : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                      } ${status === opt.val ? opt.color : ''}`}
                    >
                      <opt.icon size={20} className="mb-1.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                    </button>
                  ))}
                </div>
             </div>
          </section>

          {/* STAGE 2: MANDATORY COMMENTS */}
          <section className="relative">
             <div className="absolute -left-3 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
             <div className="pl-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                   Audit Log & Remarks
                </h4>

                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-4">
                   <div className="max-h-32 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {comments.length === 0 ? (
                         <div className="flex items-center justify-center gap-2 text-slate-400 py-2">
                            <History size={14} />
                            <span className="text-xs font-medium italic">No audit history recorded.</span>
                         </div>
                      ) : (
                         comments.map((comment) => (
                           <div key={comment.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{comment.author}</span>
                                 <span className="text-[9px] font-bold text-slate-300">{new Date(comment.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">{comment.text}</p>
                           </div>
                         ))
                      )}
                   </div>
                   <div className="relative border-t border-slate-100">
                      <MessageSquare className="absolute left-4 top-4 text-slate-400" size={16} />
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={hasStatusChanged ? "Reason for status change (Mandatory)..." : "Add an administrative note..."}
                        className={`w-full pl-11 pr-4 py-3 bg-white focus:bg-slate-50 outline-none text-sm font-medium min-h-[80px] resize-none transition-colors ${hasStatusChanged && !newComment ? 'placeholder-red-400' : 'placeholder-slate-400'}`}
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* STAGE 3: FINANCIAL SETTLEMENT */}
          <section className="relative">
             <div className="absolute -left-3 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
             <div className="pl-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] transition-colors ${isApproved ? 'bg-slate-900' : 'bg-slate-300'}`}>3</span>
                   Financial Settlement
                </h4>

                <div className={`p-6 rounded-3xl border-2 transition-all ${
                   isApproved 
                     ? 'bg-blue-50/50 border-blue-100 opacity-100' 
                     : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed grayscale'
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isApproved ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                           {isPaymentDone ? <CheckCircle size={24} /> : <DollarSign size={24} />}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-2">
                              <h5 className={`text-sm font-black uppercase tracking-tight ${isApproved ? 'text-blue-900' : 'text-slate-400'}`}>Payment Status</h5>
                              {!isApproved && <Lock size={14} className="text-slate-400" />}
                           </div>
                           
                           <label className={`flex items-center gap-3 ${isApproved ? 'cursor-pointer' : 'pointer-events-none'}`}>
                              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${isPaymentDone ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                 {isPaymentDone && <CheckCircle size={12} />}
                              </div>
                              <input 
                                 type="checkbox" 
                                 className="hidden" 
                                 checked={isPaymentDone} 
                                 onChange={(e) => isApproved && setIsPaymentDone(e.target.checked)} 
                                 disabled={!isApproved}
                              />
                              <span className="text-xs font-bold text-slate-600">Mark Invoice as Paid</span>
                           </label>
                        </div>
                    </div>

                    {isPaymentDone && (
                      <div className="mt-4 pt-4 border-t border-blue-200/50 animate-slideUp">
                         <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Settlement Date</label>
                         <div className="relative">
                           <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                           <input 
                             type="date" 
                             value={paymentDate}
                             onChange={(e) => setPaymentDate(e.target.value)}
                             className="w-full bg-white border border-blue-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                      </div>
                    )}
                </div>
                {!isApproved && !isRejected && (
                   <p className="text-[10px] font-bold text-orange-400 mt-2 flex items-center gap-1">
                      <Lock size={10} />
                      Requires Approval Status to unlock payment.
                   </p>
                )}
             </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-xs uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} className="px-8 py-3 rounded-xl font-black bg-slate-900 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all text-xs uppercase tracking-widest flex items-center gap-2">
            Confirm Workflow
            <ArrowDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoiceModal;
