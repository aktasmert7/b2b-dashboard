import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Globe2, Users, DollarSign, Package, TrendingUp, Sun, Moon, 
  CheckCircle2, Download, ArrowUp, ArrowDown, Activity, 
  RefreshCw, LayoutDashboard, BarChart3, Settings, Search, Bell, X, 
  Building2, Mail, MapPin, Shield, Save, BrainCircuit, BellOff
} from 'lucide-react';


import { StatCard } from './components/StatCard';
import { StatusBadge } from './components/StatusBadge';

// note: static backup data 
const fallbackSalesData = [
  { month: 'Jan', EU: 4000, UK: 2400, US: 2400 },
  { month: 'Feb', EU: 3000, UK: 1398, US: 2210 },
  { month: 'Mar', EU: 2000, UK: 9800, US: 2290 },
  { month: 'Apr', EU: 2780, UK: 3908, US: 2000 },
  { month: 'May', EU: 1890, UK: 4800, US: 2181 },
  { month: 'Jun', EU: 2390, UK: 3800, US: 2500 },
  { month: 'Jul', EU: 3490, UK: 4300, US: 2100 },
];

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  
  const [userProfile, setUserProfile] = useState({
    name: "Mert Aktaş",
    role: "Head of Export Sales",
    location: "Kocaeli / Turkey"
  });
  
  const [localProfile, setLocalProfile] = useState(userProfile);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [liveVolume, setLiveVolume] = useState(2400000);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  const [exchangeRates, setExchangeRates] = useState({ USD: 0, GBP: 0 });
  const [apiProducts, setApiProducts] = useState([]);
  const [apiOrders, setApiOrders] = useState([]);

  const t = isDark 
    ? { bg: 'bg-slate-900', card: 'bg-slate-800', border: 'border-slate-700', text: 'text-white', muted: 'text-slate-400', chartGrid: '#334155', chartText: '#94a3b8', tooltipBg: '#1e293b', hover: 'hover:bg-slate-700', inputBg: 'bg-slate-900/50' } 
    : { bg: 'bg-slate-50', card: 'bg-white', border: 'border-slate-200', text: 'text-slate-900', muted: 'text-slate-500', chartGrid: '#e2e8f0', chartText: '#64748b', tooltipBg: '#ffffff', hover: 'hover:bg-slate-100', inputBg: 'bg-slate-100' };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true; 
    
    fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP')
      .then(res => res.json())
      .then(data => { if (isMounted) setExchangeRates({ USD: data.rates.USD, GBP: data.rates.GBP }); })
      .catch(err => console.error("Frankfurter API timeout or blocked:", err));

    fetch('https://fakestoreapi.com/products?limit=5')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const formattedProducts = data.map(p => ({ 
          name: p.title.substring(0, 15) + '...', 
          sales: Math.round(p.price * (p?.rating?.count || 10)) 
        })).sort((a, b) => b.sales - a.sales);
        
        setApiProducts(formattedProducts);
        setIsLoadingProducts(false);
      })
      .catch(() => { if (isMounted) setIsLoadingProducts(false); });

    fetch('https://dummyjson.com/users?limit=15')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const statuses = ['Processing', 'Pending', 'Shipped'];
        const regions = ['EU', 'US', 'UK'];
        
        const mappedData = data.users.map(u => ({
          id: `#ORD-${u.id * 1024}`, 
          company: u.company?.name || `${u.firstName} LLC`, 
          region: regions[Math.floor(Math.random() * regions.length)],
          amount: `$${Math.floor(Math.random() * 20000 + 5000).toLocaleString('en-US')}`, 
          status: statuses[Math.floor(Math.random() * statuses.length)],
          date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }));
        
        setApiOrders(mappedData);
        setIsLoadingOrders(false);
        addToast("B2B Data Synced Successfully", "success");
      })
      .catch(e => {
        console.warn("Failed to fetch dummy users, check network.", e);
        if (isMounted) setIsLoadingOrders(false);
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setLiveVolume(prev => prev + Math.floor(Math.random() * 5000)), 4000);
    return () => clearInterval(interval);
  }, []);

  const processedOrders = useMemo(() => {
    let result = [...apiOrders];
    if (selectedRegion !== 'All') result = result.filter(order => order.region === selectedRegion);
    
    if (debouncedSearch) {
      const lowerQuery = debouncedSearch.toLowerCase();
      result = result.filter(order => order.company.toLowerCase().includes(lowerQuery) || order.id.toLowerCase().includes(lowerQuery));
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'amount') { 
          aValue = parseFloat(aValue.replace(/[$,]/g, '')); 
          bValue = parseFloat(bValue.replace(/[$,]/g, '')); 
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [apiOrders, selectedRegion, debouncedSearch, sortConfig]);

  const requestSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });

  const handleExportCSV = () => { //bugfix
    const csvContent = [['Order ID', 'Company', 'Region', 'Amount', 'Status', 'Date'].join(','), ...processedOrders.map(row => `${row.id},${row.company},${row.region},"${row.amount}",${row.status},${row.date}`)].join('\n');
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })); 
    link.download = `Export_Report_${selectedRegion}.csv`; 
    link.click();
    addToast("CSV Report Downloaded", "success");
  };

  const handleGenerateAIReport = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      addToast("Deep AI Report generated and sent to your email.", "success");
    }, 2500); 
  };

  const handleSaveProfile = () => {
    setUserProfile(localProfile);
    addToast("Profile Settings Saved & Synced", "success");
  };

  const renderDashboard = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="Total Export Volume" value={`$${(liveVolume / 1000000).toFixed(3)}M`} icon={DollarSign} trend="Live Tracking" t={t} isLive={true} />
        <StatCard title="Active B2B Partners" value="1,240" icon={Users} trend="+4.2%" t={t} />
        <StatCard title="Total Shipments" value="8,459" icon={Package} trend="+8.1%" t={t} />
        <StatCard title="Avg. Deal Size" value="$14,500" icon={TrendingUp} trend="+2.4%" t={t} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`lg:col-span-2 p-6 rounded-xl border ${t.border} ${t.card} shadow-lg`}>
          <div className="mb-6"><h3 className={`text-lg font-semibold ${t.text}`}>Revenue by Region</h3></div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fallbackSalesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
                <XAxis dataKey="month" stroke={t.chartText} tick={{fill: t.chartText}} tickLine={false} axisLine={false} />
                <YAxis stroke={t.chartText} tick={{fill: t.chartText}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: t.tooltipBg, border: `1px solid ${t.chartGrid}`, borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
                {(selectedRegion === 'All' || selectedRegion === 'EU') && <Line type="monotone" dataKey="EU" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />}
                {(selectedRegion === 'All' || selectedRegion === 'UK') && <Line type="monotone" dataKey="UK" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />}
                {(selectedRegion === 'All' || selectedRegion === 'US') && <Line type="monotone" dataKey="US" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${t.border} ${t.card} shadow-lg relative overflow-hidden`}>
          {isLoadingProducts && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /></div>}
          <div className="mb-6"><h3 className={`text-lg font-semibold ${t.text}`}>Top Products</h3><p className={`${t.muted} text-xs mt-1`}>API Data</p></div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiProducts} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke={t.chartText} tick={{fill: t.chartText, fontSize: 11}} tickLine={false} axisLine={false} width={100} />
                <Tooltip cursor={{fill: t.chartGrid, opacity: 0.4}} contentStyle={{ backgroundColor: t.tooltipBg, border: `1px solid ${t.chartGrid}`, borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${t.border} ${t.card} shadow-lg relative overflow-hidden`}>
        {isLoadingOrders && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><span className="text-blue-400 font-medium">Fetching secure B2B data...</span></div>
          </div>
        )}
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <div>
            <h3 className={`text-lg font-semibold ${t.text}`}>Live Order Stream</h3>
            <p className={`${t.muted} text-sm mt-1`}>{debouncedSearch ? `Searching: "${debouncedSearch}"` : 'Real companies fetched from network.'}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${t.muted}`} />
              <input type="text" placeholder="Search orders or companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-9 pr-4 py-2 rounded-lg border ${t.border} ${t.inputBg} ${t.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm`} />
            </div>
            <div className={`flex w-full sm:w-auto items-center p-1 rounded-lg border ${t.border} ${t.inputBg}`}>
              {['All', 'EU', 'US', 'UK'].map(region => (
                <button key={region} onClick={() => setSelectedRegion(region)} className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${selectedRegion === region ? 'bg-blue-600 text-white shadow-md' : `${t.muted} hover:${t.text}`}`}>{region}</button>
              ))}
            </div>
            <button onClick={handleExportCSV} className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${t.border} ${t.muted} text-sm`}>
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('company')}><div className="flex items-center gap-1">Company {sortConfig.key === 'company' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div></th>
                <th className="pb-3 font-medium cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('region')}><div className="flex items-center gap-1">Region {sortConfig.key === 'region' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div></th>
                <th className="pb-3 font-medium cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('amount')}><div className="flex items-center gap-1">Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div></th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {processedOrders.map((order) => (
                <tr key={order.id} className={`border-b ${t.border} last:border-0 hover:bg-slate-500/5 transition-colors animate-in fade-in duration-300`}>
                  <td className={`py-4 ${t.text} font-medium text-blue-400`}>{order.id}</td>
                  <td className={`py-4 ${t.text}`}>{order.company}</td>
                  <td className={`py-4 ${t.muted}`}>{order.region}</td>
                  <td className={`py-4 ${t.text} font-semibold`}>{order.amount}</td>
                  <td className="py-4"><StatusBadge status={order.status} /></td>
                  <td className={`py-4 ${t.muted} text-sm`}>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoadingOrders && processedOrders.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Search className={`w-12 h-12 ${t.muted} mb-3 opacity-20`} />
              <p className={`${t.text} font-medium`}>No matching records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const marketShareData = [
      { name: 'EU Hub', value: 45 }, { name: 'US Market', value: 35 }, { name: 'UK Market', value: 20 }
    ];
    
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className={`text-2xl font-bold ${t.text} mb-6`}>Advanced Market Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border ${t.border} ${t.card} shadow-lg`}>
            <h3 className={`text-lg font-semibold ${t.text} mb-6`}>Global Market Share</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={marketShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {marketShareData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: t.tooltipBg, border: `1px solid ${t.chartGrid}`, borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {marketShareData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></span><span className={`${t.text} text-sm`}>{entry.name} ({entry.value}%)</span></div>
              ))}
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border ${t.border} ${t.card} shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden`}>
            {isGeneratingAI && <div className="absolute inset-0 bg-blue-500/5 animate-pulse z-0" />}
            <div className="z-10 flex flex-col items-center">
              <Activity className={`w-16 h-16 ${isGeneratingAI ? 'text-blue-400 animate-bounce' : 'text-blue-500'} mb-4 transition-colors duration-300`} />
              <h3 className={`text-xl font-bold ${t.text} mb-2`}>AI Export Forecasting</h3>
              <p className={`${t.muted} max-w-sm mb-6`}>Based on your recent API data, the algorithm predicts a 14.5% growth in the EU Hub for the next quarter.</p>
              <button onClick={handleGenerateAIReport} disabled={isGeneratingAI} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg ${isGeneratingAI ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25'}`}>
                {isGeneratingAI ? <><RefreshCw className="w-5 h-5 animate-spin" /> Processing Data...</> : <><BrainCircuit className="w-5 h-5" /> Generate Deep Report</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPartners = () => {
    const uniqueCompanies = Array.from(new Set(apiOrders.map(o => o.company))).slice(0, 9);
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className={`text-2xl font-bold ${t.text} mb-6`}>B2B Partner Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueCompanies.map((company, i) => (
            <div key={i} className={`p-6 rounded-xl border ${t.border} ${t.card} shadow-lg ${t.hover} transition-all cursor-pointer`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h3 className={`font-bold ${t.text}`}>{company}</h3>
                  <p className={`${t.muted} text-xs`}>Active Partner</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-400 font-medium"><Mail className="w-4 h-4" /> <span>contact@{company.replace(/\s+/g, '').toLowerCase()}.com</span></div>
            </div>
          ))}
          {uniqueCompanies.length === 0 && <p className={t.muted}>Loading partners from API...</p>}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <h2 className={`text-2xl font-bold ${t.text} mb-6`}>Account Settings</h2>
      <div className={`rounded-xl border ${t.border} ${t.card} shadow-lg overflow-hidden`}>
        <div className={`p-6 border-b ${t.border}`}>
          <h3 className={`text-lg font-semibold ${t.text} flex items-center gap-2`}><Shield className="w-5 h-5 text-blue-500"/> Profile Information</h3>
          <p className={`${t.muted} text-sm mt-1`}>Update your global export management details.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${t.muted} mb-2`}>Full Name</label>
              <input type="text" value={localProfile.name} onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})} className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.inputBg} ${t.text} focus:outline-none focus:border-blue-500 transition-colors`} />
            </div>
            <div>
              <label className={`block text-sm font-medium ${t.muted} mb-2`}>Professional Role</label>
              <input type="text" value={localProfile.role} onChange={(e) => setLocalProfile({...localProfile, role: e.target.value})} className={`w-full px-4 py-2 rounded-lg border ${t.border} ${t.inputBg} ${t.text} focus:outline-none focus:border-blue-500 transition-colors`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${t.muted} mb-2`}>Office Location</label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-2.5 w-5 h-5 ${t.muted}`} />
                <input type="text" value={localProfile.location} onChange={(e) => setLocalProfile({...localProfile, location: e.target.value})} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${t.border} ${t.inputBg} ${t.text} focus:outline-none focus:border-blue-500 transition-colors`} />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/25">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${t.bg} font-sans`}>
      <aside className={`w-20 lg:w-64 border-r ${t.border} ${t.card} flex flex-col justify-between transition-all duration-300 z-20`}>
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-transparent">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 relative">
              <Globe2 className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
            </div>
            <span className={`hidden lg:block ml-3 font-bold text-lg tracking-tight ${t.text}`}>B2B Hub</span>
          </div>
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'customers', icon: Users, label: 'B2B Partners' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all ${activeMenu === item.id ? 'bg-blue-600/10 text-blue-500' : `${t.muted} ${t.hover}`}`}>
                <item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-blue-500' : ''}`} />
                <span className={`hidden lg:block ml-3 font-medium text-sm ${activeMenu === item.id ? 'text-blue-500' : ''}`}>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-transparent">
          <div className={`flex items-center justify-center lg:justify-start p-2 rounded-xl border ${t.border} bg-slate-800/50`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              {getInitials(userProfile.name)}
            </div>
            <div className="hidden lg:block ml-3 overflow-hidden">
              <p className={`text-sm font-semibold ${t.text} truncate`}>{userProfile.name}</p>
              <p className={`text-xs ${t.muted} truncate`}>{userProfile.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-slate-900/20">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${t.text} capitalize`}>{activeMenu.replace('-', ' ')}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className={`${t.muted} text-sm`}>Real-time export analytics connected to live APIs</p>
                {exchangeRates.USD !== 0 && (
                  <div className={`hidden md:flex items-center gap-2 px-2 py-0.5 rounded border ${t.border} ${t.card} text-[10px] font-mono`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400">EUR/USD: {exchangeRates.USD}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button onClick={() => { setIsDark(!isDark); addToast(`${!isDark ? 'Dark' : 'Light'} theme enabled`, "info"); }} className={`p-2 rounded-lg border ${t.border} ${t.card} hover:ring-2 ring-blue-500 transition-all`} title="Toggle Theme">
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              
              <div className="relative">
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2 rounded-lg border ${t.border} ${isNotificationsOpen ? 'bg-slate-700' : t.card} ${t.hover} transition-all`}>
                  <Bell className={`w-5 h-5 ${t.muted}`} />
                </button>
                {isNotificationsOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl border ${t.border} ${t.card} shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    <div className={`p-3 border-b ${t.border} flex justify-between items-center`}>
                      <span className={`text-sm font-semibold ${t.text}`}>Notifications</span>
                      <button onClick={() => setIsNotificationsOpen(false)} className={`${t.muted} hover:${t.text}`}><X className="w-4 h-4"/></button>
                    </div>
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} flex items-center justify-center mb-3`}>
                        <BellOff className={`w-6 h-6 ${t.muted} opacity-50`} />
                      </div>
                      <p className={`${t.text} font-medium text-sm`}>All caught up!</p>
                      <p className={`${t.muted} text-xs mt-1`}>You have no new notifications.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {activeMenu === 'dashboard' && renderDashboard()}
          {activeMenu === 'analytics' && renderAnalytics()}
          {activeMenu === 'customers' && renderPartners()}
          {activeMenu === 'settings' && renderSettings()}
          
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Activity className="w-5 h-5 text-blue-500" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))} className="ml-2 text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}