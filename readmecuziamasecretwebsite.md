import React, { useState, useMemo } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  PieChart, 
  Settings, 
  Search, 
  Bell, 
  MoreHorizontal, 
  FileText, 
  ChevronDown, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Menu,
  PhoneIncoming,
  FolderOpen,
  X,
  Save,
  ArrowRight
} from 'lucide-react';

// --- Types ---

type Priority = 'Hoch' | 'Mittel' | 'Niedrig';
type Status = 'Aktiv' | 'Wartend' | 'Abgeschlossen' | 'Neu' | 'Bearbeitet';
type Category = 'Psychosoziale Beratung' | 'Krisenintervention' | 'Terminvereinbarung' | 'Info';
type Area = 'Leipzig Stadt' | 'LK Nordsachsen' | 'LK Leipzig';

interface Case {
  id: string;
  clientInitials: string; // Anonymized
  area: Area;
  category: Category;
  status: Status;
  priority: Priority;
  lastUpdate: string;
  counselor: string;
}

interface Inquiry {
  id: string;
  type: 'Telefon' | 'E-Mail' | 'Persönlich';
  subject: string;
  date: string;
  status: Status; // Neu, Bearbeitet
}

// --- Mock Data Initialization ---

const INITIAL_CASES: Case[] = [
  { id: 'B-2401', clientInitials: 'A.S.', area: 'Leipzig Stadt', category: 'Psychosoziale Beratung', status: 'Aktiv', priority: 'Hoch', lastUpdate: '2 Std.', counselor: 'S. Weber' },
  { id: 'B-2402', clientInitials: 'K.M.', area: 'LK Nordsachsen', category: 'Krisenintervention', status: 'Wartend', priority: 'Mittel', lastUpdate: '1 Tag', counselor: 'J. Müller' },
  { id: 'B-2403', clientInitials: 'Unknown', area: 'LK Leipzig', category: 'Psychosoziale Beratung', status: 'Aktiv', priority: 'Mittel', lastUpdate: '3 Tage', counselor: 'S. Weber' },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  { id: 'AN-892', type: 'Telefon', subject: 'Terminanfrage Erstgespräch', date: 'Heute, 09:15', status: 'Neu' },
  { id: 'AN-891', type: 'E-Mail', subject: 'Rückfrage zu Angebot', date: 'Gestern, 14:30', status: 'Bearbeitet' },
  { id: 'AN-890', type: 'Telefon', subject: 'Weitervermittlung', date: 'Gestern, 11:00', status: 'Neu' },
];

// --- Components ---

const StatusBadge = ({ status, onClick }: { status: string, onClick?: () => void }) => {
  const styles: Record<string, string> = {
    Aktiv: 'bg-blue-50 text-blue-700 border-blue-100',
    Neu: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    Wartend: 'bg-amber-50 text-amber-700 border-amber-100',
    Abgeschlossen: 'bg-slate-50 text-slate-600 border-slate-100',
    Bearbeitet: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  const icons: Record<string, React.ReactNode> = {
    Aktiv: <Clock size={12} className="mr-1.5" />,
    Neu: <AlertCircle size={12} className="mr-1.5" />,
    Wartend: <Clock size={12} className="mr-1.5" />,
    Abgeschlossen: <CheckCircle2 size={12} className="mr-1.5" />,
    Bearbeitet: <CheckCircle2 size={12} className="mr-1.5" />,
  };

  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${styles[status] || styles.Abgeschlossen} ${onClick ? 'hover:brightness-95 cursor-pointer' : ''}`}
    >
      {icons[status]}
      {status}
    </button>
  );
};

const PriorityDot = ({ priority }: { priority: string }) => {
  const dots: Record<string, string> = {
    Hoch: 'bg-rose-500',
    Mittel: 'bg-orange-400',
    Niedrig: 'bg-slate-400',
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`h-1.5 w-1.5 rounded-full ${dots[priority]}`} />
      <span className="text-sm text-slate-600">{priority}</span>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false, count, onClick }: { icon: any, label: string, active?: boolean, count?: number, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group mb-1 ${
      active 
        ? 'bg-blue-50 text-blue-700 font-medium' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={18} className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
      <span>{label}</span>
    </div>
    {count !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
        {count}
      </span>
    )}
  </button>
);

const NavSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

// --- New Entry Modal ---

const NewEntryModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (type: 'case' | 'inquiry', data: any) => void }) => {
  const [activeType, setActiveType] = useState<'case' | 'inquiry'>('inquiry');
  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    clientInitials: '',
    area: 'Leipzig Stadt',
    priority: 'Mittel'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(activeType, formData);
    onClose();
    // Reset form roughly
    setFormData({ subject: '', clientInitials: '', area: 'Leipzig Stadt', priority: 'Mittel' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Neuer Eintrag</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {/* Type Toggle */}
        <div className="p-4 flex space-x-2">
          <button 
            onClick={() => setActiveType('inquiry')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${activeType === 'inquiry' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <PhoneIncoming size={16} className="inline mr-2 -mt-0.5" />
            Anfrage
          </button>
          <button 
            onClick={() => setActiveType('case')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${activeType === 'case' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <FolderOpen size={16} className="inline mr-2 -mt-0.5" />
            Beratungsfall
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {activeType === 'inquiry' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Betreff / Anliegen</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                  placeholder="z.B. Terminvereinbarung..."
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kontaktart</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                  <option>Telefon</option>
                  <option>E-Mail</option>
                  <option>Persönlich</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Klientenkürzel (Anonym)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="z.B. A.B."
                    value={formData.clientInitials}
                    onChange={e => setFormData({...formData, clientInitials: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Priorität</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option>Hoch</option>
                    <option>Mittel</option>
                    <option>Niedrig</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Projektbereich</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                >
                  <option>Leipzig Stadt</option>
                  <option>LK Nordsachsen</option>
                  <option>LK Leipzig</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kategorie</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                  <option>Psychosoziale Beratung</option>
                  <option>Krisenintervention</option>
                  <option>Rechtsinformation</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Abbrechen</button>
            <button type="submit" className={`px-4 py-2 text-sm text-white font-medium rounded-lg shadow-sm transition-colors ${activeType === 'case' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Application ---

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'cases' | 'inquiries' | 'stats'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  
  // Data State
  const [cases, setCases] = useState<Case[]>(INITIAL_CASES);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);

  // Stats
  const stats = useMemo(() => {
    return {
      activeCases: cases.filter(c => c.status === 'Aktiv').length,
      newInquiries: inquiries.filter(i => i.status === 'Neu').length,
      totalCases: cases.length
    };
  }, [cases, inquiries]);

  // Handlers
  const handleSaveEntry = (type: 'case' | 'inquiry', data: any) => {
    if (type === 'case') {
      const newCase: Case = {
        id: `B-${Math.floor(2404 + Math.random() * 100)}`,
        clientInitials: data.clientInitials,
        area: data.area as Area,
        category: 'Psychosoziale Beratung',
        status: 'Aktiv',
        priority: data.priority as Priority,
        lastUpdate: 'Gerade eben',
        counselor: 'Ich'
      };
      setCases([newCase, ...cases]);
      setCurrentView('cases');
    } else {
      const newInquiry: Inquiry = {
        id: `AN-${Math.floor(900 + Math.random() * 100)}`,
        type: 'Telefon',
        subject: data.subject,
        date: 'Gerade eben',
        status: 'Neu'
      };
      setInquiries([newInquiry, ...inquiries]);
      setCurrentView('inquiries');
    }
  };

  const toggleStatus = (id: string, type: 'case' | 'inquiry') => {
    if (type === 'case') {
      setCases(cases.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'Aktiv' ? 'Abgeschlossen' : 'Aktiv';
          return { ...c, status: nextStatus };
        }
        return c;
      }));
    } else {
      setInquiries(inquiries.map(i => {
        if (i.id === id) {
          const nextStatus = i.status === 'Neu' ? 'Bearbeitet' : 'Neu';
          return { ...i, status: nextStatus };
        }
        return i;
      }));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      <NewEntryModal 
        isOpen={isEntryModalOpen} 
        onClose={() => setIsEntryModalOpen(false)} 
        onSave={handleSaveEntry}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-14 flex items-center px-5 border-b border-slate-100">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center mr-3 shadow-sm">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">Bellis Statistik</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-3">
            <NavSection title="Übersicht">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={currentView === 'dashboard'} 
                onClick={() => setCurrentView('dashboard')} 
              />
              <SidebarItem 
                icon={Bell} 
                label="Benachrichtigungen" 
                count={2} 
                onClick={() => {}} 
              />
            </NavSection>

            <NavSection title="Datenerfassung">
              <SidebarItem 
                icon={PhoneIncoming} 
                label="Anfragen" 
                count={stats.newInquiries} 
                active={currentView === 'inquiries'}
                onClick={() => setCurrentView('inquiries')}
              />
              <SidebarItem 
                icon={FolderOpen} 
                label="Beratungsfälle" 
                count={stats.activeCases} 
                active={currentView === 'cases'}
                onClick={() => setCurrentView('cases')}
              />
            </NavSection>

            <NavSection title="Analyse">
              <SidebarItem 
                icon={PieChart} 
                label="Statistik Export" 
                active={currentView === 'stats'}
                onClick={() => setCurrentView('stats')}
              />
            </NavSection>

            <NavSection title="System">
              <SidebarItem icon={Settings} label="Einstellungen" onClick={() => {}} />
            </NavSection>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center w-full space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Jane Doe</p>
                <p className="text-xs text-slate-500 truncate">Fachberatung Leipzig</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center text-sm text-slate-500">
              <span className="font-medium text-slate-900">
                {currentView === 'dashboard' && 'Übersicht'}
                {currentView === 'cases' && 'Beratungsfälle'}
                {currentView === 'inquiries' && 'Anfragenverwaltung'}
                {currentView === 'stats' && 'Statistiken & Export'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Suchen..." 
                className="pl-9 pr-4 py-1.5 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
              />
            </div>
            <button 
              onClick={() => setIsEntryModalOpen(true)}
              className="inline-flex items-center justify-center h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
            >
              <Plus size={14} className="mr-1.5" />
              Neu
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* DASHBOARD VIEW */}
            {currentView === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aktive Fälle</p>
                        <h3 className="text-2xl font-semibold text-slate-900 mt-1">{stats.activeCases}</h3>
                      </div>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FolderOpen size={20} /></div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">Insgesamt {stats.totalCases} Fälle in 2024</div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Offene Anfragen</p>
                        <h3 className="text-2xl font-semibold text-slate-900 mt-1">{stats.newInquiries}</h3>
                      </div>
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><PhoneIncoming size={20} /></div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">2 heute eingegangen</div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nächster Export</p>
                        <h3 className="text-lg font-semibold text-slate-900 mt-1">30. Juni</h3>
                      </div>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><PieChart size={20} /></div>
                    </div>
                    <button onClick={() => setCurrentView('stats')} className="mt-4 text-xs text-emerald-600 font-medium hover:underline flex items-center">
                      Zum Export <ArrowRight size={12} className="ml-1" />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 font-medium text-sm text-slate-900">
                    Schnellzugriff: Zuletzt bearbeitet
                  </div>
                  <div className="divide-y divide-slate-100">
                    {cases.slice(0, 2).map(c => (
                      <div key={c.id} onClick={() => setCurrentView('cases')} className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{c.clientInitials}</div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">Fall {c.id}</div>
                              <div className="text-xs text-slate-500">{c.category}</div>
                            </div>
                         </div>
                         <div className="text-xs text-slate-400">Vor {c.lastUpdate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* CASES VIEW */}
            {currentView === 'cases' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Fallakte</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded text-slate-600">Filter</button>
                    <button className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded text-slate-600">Export</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">ID / Klient*in</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Priorität</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Bereich</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cases.map((c) => (
                        <tr key={c.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 mr-3">
                                {c.clientInitials}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 text-sm">{c.id}</div>
                                <div className="text-xs text-slate-500">{c.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={c.status} onClick={() => toggleStatus(c.id, 'case')} />
                          </td>
                          <td className="py-4 px-6"><PriorityDot priority={c.priority} /></td>
                          <td className="py-4 px-6 text-sm text-slate-600">{c.area}</td>
                          <td className="py-4 px-6 text-xs text-slate-500">{c.lastUpdate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INQUIRIES VIEW */}
            {currentView === 'inquiries' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Anfragen & Erstkontakte</h3>
                  <button onClick={() => setIsEntryModalOpen(true)} className="text-xs text-blue-600 hover:underline">Manuell erfassen</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">ID / Kanal</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Betreff</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Eingang</th>
                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inquiries.map((i) => (
                        <tr key={i.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className={`mr-3 p-1.5 rounded-md ${i.type === 'Telefon' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
                                {i.type === 'Telefon' ? <PhoneIncoming size={14} /> : <FileText size={14} />}
                              </div>
                              <span className="text-sm font-medium text-slate-900">{i.id}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600">{i.subject}</td>
                          <td className="py-4 px-6">
                            <StatusBadge status={i.status} onClick={() => toggleStatus(i.id, 'inquiry')} />
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500">{i.date}</td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Zu Fall wandeln</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STATS VIEW */}
            {currentView === 'stats' && (
              <div className="space-y-6">
                <div className="bg-blue-900 text-white rounded-xl p-6 shadow-md">
                   <h2 className="text-lg font-semibold mb-2">Jahresstatistik 2024</h2>
                   <p className="text-blue-200 text-sm max-w-xl">
                     Hier können Sie die gesetzlich geforderten Daten für die Fachberatungsstellen exportieren. 
                     Nutzen Sie die Presets für standardisierte Berichte.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4">Export Presets</h3>
                    <div className="space-y-3">
                      {['Statistik FB Leipzig (Jahresbericht)', 'Statistik LK Nordsachsen', 'Statistik LK Leipzig'].map((preset) => (
                        <div key={preset} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                          <div className="flex items-center">
                            <FileText size={18} className="text-slate-400 group-hover:text-blue-500 mr-3" />
                            <span className="text-sm text-slate-700 font-medium">{preset}</span>
                          </div>
                          <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-semibold text-slate-900 mb-4">Verteilung nach Projektbereich</h3>
                     <div className="space-y-4">
                        {[
                          { label: 'Leipzig Stadt', percent: '45%', val: 45 }, 
                          { label: 'LK Nordsachsen', percent: '30%', val: 30 }, 
                          { label: 'LK Leipzig', percent: '25%', val: 25 }
                        ].map(stat => (
                          <div key={stat.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-slate-700">{stat.label}</span>
                              <span className="text-slate-500">{stat.percent}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stat.val}%` }} />
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}