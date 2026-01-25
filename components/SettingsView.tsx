
import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Globe, Palette, Bell, Wrench, MapPin, 
  RefreshCw, HardDrive, FileBarChart, Users, HelpCircle, 
  ChevronRight, Save, Lock, Smartphone, Moon, Sun, 
  LogOut, Trash2, SmartphoneNfc, Mail, Database
} from 'lucide-react';

interface SettingsViewProps {
  isAdmin: boolean;
  currentTheme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const SECTIONS = [
  { id: 'profile', label: 'User & Account', icon: User, color: 'text-blue-600' },
  { id: 'security', label: 'Security & Privacy', icon: Shield, color: 'text-emerald-600' },
  { id: 'language', label: 'Language & Region', icon: Globe, color: 'text-indigo-600' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-purple-600' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-600' },
  { id: 'equipment', label: 'Equipment Mgmt', icon: Wrench, color: 'text-slate-600' },
  { id: 'location', label: 'Location & GPS', icon: MapPin, color: 'text-red-600' },
  { id: 'data', label: 'Data & Sync', icon: RefreshCw, color: 'text-cyan-600' },
  { id: 'storage', label: 'Storage & Files', icon: HardDrive, color: 'text-orange-600' },
  { id: 'reports', label: 'Reports & Export', icon: FileBarChart, color: 'text-teal-600' },
  { id: 'roles', label: 'Roles & Permissions', icon: Users, color: 'text-pink-600', adminOnly: true },
  { id: 'support', label: 'Support & Info', icon: HelpCircle, color: 'text-blue-500' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ isAdmin, currentTheme, onThemeToggle }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Admin User',
    role: 'Super Admin',
    company: 'TRAN JI',
    language: 'English',
    dateFormat: 'DD-MM-YYYY',
    autoLock: '5 min',
    notifications: {
      email: true,
      push: true,
      calibration: true,
      breakdown: true
    },
    gpsEnabled: true
  });

  const handleToggle = (key: string) => {
    // Mock toggle logic for demonstration
    console.log(`Toggled ${key}`);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-4xl shadow-inner">
                👨‍💼
              </div>
              <div>
                <button className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-xl mb-2 hover:bg-blue-700 transition-colors">Change Photo</button>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Max size 2MB (JPG/PNG)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input type="text" defaultValue={formData.name} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                <input type="text" defaultValue={formData.role} disabled className="w-full p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</label>
                <input type="text" defaultValue={formData.company} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                <input type="email" defaultValue="admin@trange.sa" disabled className="w-full p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 cursor-not-allowed" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                <Save size={16} /> Save Changes
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Change Password
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock size={16} className="text-emerald-500" /> App Security
              </h4>
              <div className="space-y-4">
                <ToggleRow label="Enable App Lock (PIN / Biometric)" description="Require authentication when opening the app" active={true} />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto-Lock Timer</p>
                    <p className="text-[10px] text-slate-400 font-medium">Lock app after inactivity</p>
                  </div>
                  <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold px-3 py-2 outline-none">
                    <option>Immediately</option>
                    <option>1 Minute</option>
                    <option selected>5 Minutes</option>
                    <option>30 Minutes</option>
                  </select>
                </div>
                <ToggleRow label="Two-Factor Authentication" description="Send OTP via Email for new logins" active={false} />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={16} className="text-blue-500" /> Data Privacy
              </h4>
              <div className="space-y-4">
                <ToggleRow label="Data Encryption" description="Encrypt local data storage" active={true} />
                <ToggleRow label="Mask Sensitive Info" description="Hide serial numbers in list view" active={false} />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={currentTheme === 'dark' ? onThemeToggle : undefined}
                className={`relative p-6 rounded-3xl border-2 transition-all ${currentTheme === 'light' ? 'border-blue-500 bg-blue-50/50 dark:bg-transparent' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
              >
                <div className="w-full h-32 bg-slate-100 rounded-2xl mb-4 border border-slate-200 shadow-sm flex items-center justify-center">
                  <Sun size={32} className="text-amber-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-white">Light Mode</span>
                  {currentTheme === 'light' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
              </button>

              <button 
                onClick={currentTheme === 'light' ? onThemeToggle : undefined}
                className={`relative p-6 rounded-3xl border-2 transition-all ${currentTheme === 'dark' ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-200 hover:border-emerald-300'}`}
              >
                <div className="w-full h-32 bg-slate-900 rounded-2xl mb-4 border border-slate-700 shadow-sm flex items-center justify-center">
                  <Moon size={32} className="text-emerald-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-white">Dark Mode</span>
                  {currentTheme === 'dark' && <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>}
                </div>
              </button>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-black text-slate-900 dark:text-white">Interface Density</h4>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['Compact', 'Comfortable', 'Spacious'].map((opt, idx) => (
                    <button key={opt} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${idx === 1 ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {opt}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="space-y-4">
                <ToggleRow label="Push Notifications" description="Receive alerts on your device" active={true} />
                <ToggleRow label="Email Notifications" description="Daily digests and urgent alerts" active={true} />
             </div>
             
             <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-4"></div>
             
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Alert Types</h4>
             <div className="space-y-4">
                <ToggleRow label="Calibration Expiry" description="Notify 7 days before due date" active={true} />
                <ToggleRow label="Rental Return Due" description="Notify on scheduled return date" active={true} />
                <ToggleRow label="Maintenance Reminders" description="Scheduled service alerts" active={false} />
                <ToggleRow label="New Documents Uploaded" description="When team members add files" active={false} />
             </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                   <SmartphoneNfc size={16} className="text-blue-500" /> Identification
                </h4>
                <div className="space-y-4">
                   <ToggleRow label="Enable QR Scanning" description="Use camera to scan asset tags" active={true} />
                   <ToggleRow label="Barcode Support" description="Support Code-128 and UPC" active={false} />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default ID Format</label>
                <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm outline-none">
                   <option>TRJ-{'{SEQ}'} (e.g. TRJ-001)</option>
                   <option>{'{TYPE}'}-{'{SEQ}'} (e.g. RENT-001)</option>
                   <option>Manual Entry</option>
                </select>
             </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg">
                         <RefreshCw size={20} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-900 dark:text-white">Cloud Sync</h4>
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Last synced: Just now</p>
                      </div>
                   </div>
                   <div className="h-3 w-3 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
                </div>
                <ToggleRow label="Auto-Sync" description="Sync when connected to Wi-Fi" active={true} />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                   <Database size={24} className="text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" />
                   <div className="text-xs font-black text-slate-900 dark:text-white">Backup Data</div>
                   <div className="text-[10px] text-slate-400">Create local copy</div>
                </button>
                <button className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                   <RefreshCw size={24} className="text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" />
                   <div className="text-xs font-black text-slate-900 dark:text-white">Restore</div>
                   <div className="text-[10px] text-slate-400">From backup file</div>
                </button>
             </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-xl font-black mb-2">Need Help?</h3>
                   <p className="text-slate-400 text-sm mb-6 max-w-xs">Our support team is available 24/7 to assist with any technical issues.</p>
                   <div className="flex gap-3">
                      <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                         <Mail size={14} /> Email Support
                      </button>
                      <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                         <Smartphone size={14} /> WhatsApp
                      </button>
                   </div>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                   <HelpCircle size={180} />
                </div>
             </div>

             <div className="space-y-2">
                <ListItem label="User Guide & Documentation" />
                <ListItem label="Privacy Policy" />
                <ListItem label="Terms of Service" />
                <ListItem label="About App Version 2.4.0 (Stable)" />
             </div>
          </div>
        );

      default:
        return <div className="text-center py-20 text-slate-400">Settings category under construction.</div>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-fadeIn">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white dark:bg-gray-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
          <p className="text-xs font-bold text-slate-400 mt-1">Manage preferences</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {SECTIONS.map((section) => {
            if (section.adminOnly && !isAdmin) return null;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-slate-100 dark:bg-slate-900'}`}>
                    <section.icon size={18} className={section.color} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide">{section.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-slate-400" />}
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-50 dark:border-slate-800">
           <button className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors font-bold text-xs uppercase tracking-widest">
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white dark:bg-gray-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
           <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Configure your workspace preferences</p>
           </div>
           {activeSection === 'profile' && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                 Admin Access
              </span>
           )}
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {renderSectionContent()}
        </div>
      </main>
    </div>
  );
};

const ToggleRow: React.FC<{ label: string; description: string; active: boolean; onClick?: () => void }> = ({ label, description, active, onClick }) => (
  <div className="flex items-center justify-between py-2 group cursor-pointer" onClick={onClick}>
    <div>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{label}</p>
      <p className="text-[10px] text-slate-400 font-medium">{description}</p>
    </div>
    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-4' : ''}`}></div>
    </div>
  </div>
);

const ListItem: React.FC<{ label: string }> = ({ label }) => (
  <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
     <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600">{label}</span>
     <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default SettingsView;
