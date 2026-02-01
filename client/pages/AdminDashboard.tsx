import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Check, X, Search, MoreHorizontal, 
  Loader2, Bell, Clock, LogOut, ArrowUpRight, ArrowDownLeft, RefreshCw, Users, ChevronDown, List 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter'; 

// --- COMPONENTS ---

// 1. Notification Bell
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const hasUnread = safeNotifications.some((n: any) => !n.isRead);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if(!token) return;
      const res = await fetch('/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      if(res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: { 'x-auth-token': token || '' }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark read");
    }
  };

  const toggleOpen = () => {
    if(!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleOpen} className="relative p-2 rounded-full text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
        <Bell className="w-5 h-5" />
        {hasUnread && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-50/50 p-3 border-b border-emerald-100 flex justify-between items-center">
            <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">Admin Alerts</h4>
            {hasUnread && <button onClick={markAllRead} className="text-xs text-emerald-600 font-medium hover:underline">Mark read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {safeNotifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">No new alerts.</div>
            ) : (
                safeNotifications.map((notif: any) => (
                    <div key={notif._id} className={`p-3 border-b border-slate-50 transition-colors ${!notif.isRead ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                        <p className={`text-sm leading-snug ${!notif.isRead ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{notif.message}</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN ADMIN DASHBOARD ---
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposited: 0,
    pendingWithdrawals: 0,
    totalPayouts: 0,
    recentTransactions: [] // Will be populated by /api/admin/transactions
  });
  
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const [visibleCount, setVisibleCount] = useState(10); // Show 10 by default

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; 
  };

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return handleLogout();

    try {
      // 1. Get Summary Stats
      const statsRes = await fetch('/api/admin/stats', { headers: { 'x-auth-token': token } });
      if (!statsRes.ok) throw new Error("Unauthorized");
      const statsData = await statsRes.json();

      // 2. Get Transaction History (NEW ENDPOINT CALL)
      const txRes = await fetch('/api/admin/transactions', { headers: { 'x-auth-token': token } });
      const txData = await txRes.json();

      // Combine Data
      setStats({
        ...statsData,
        recentTransactions: Array.isArray(txData) ? txData : []
      });

      // 3. Get Withdrawals
      const withdrawRes = await fetch('/api/admin/withdrawals', { headers: { 'x-auth-token': token } });
      const withdrawData = await withdrawRes.json();
      setWithdrawals(Array.isArray(withdrawData) ? withdrawData : []);

    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify({ status })
      });
      if (res.ok) loadData(); 
    } catch (err) {
      alert("Action failed");
    }
  };

  const getTxTypeStyles = (type: string) => {
    switch (type) {
        case 'deposit': return { icon: <ArrowDownLeft className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-100', label: 'Deposit' };
        case 'withdrawal': return { icon: <ArrowUpRight className="w-4 h-4" />, color: 'text-red-600 bg-red-100', label: 'Withdrawal' };
        case 'referral_bonus': return { icon: <Users className="w-4 h-4" />, color: 'text-purple-600 bg-purple-100', label: 'Commission' };
        case 'profit_payout': return { icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-600 bg-blue-100', label: 'Cycle Payout' };
        default: return { icon: <Clock className="w-4 h-4" />, color: 'text-slate-600 bg-slate-100', label: type };
    }
  };

  const StatCard = ({ title, value, color }: any) => (
    <div className="p-6 rounded-xl border border-emerald-100 bg-white shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
    </div>
  );

  const safeTransactions = Array.isArray(stats.recentTransactions) ? stats.recentTransactions : [];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-emerald-50">
       <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-emerald-50/40 pb-20">
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 bg-slate-100/50 p-1 rounded-lg">
          <Button 
            variant="ghost" size="sm" onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-emerald-600"}
          >
            Overview
          </Button>
          <Button 
            variant="ghost" size="sm" onClick={() => setActiveTab("transactions")}
            className={activeTab === "transactions" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-emerald-600"}
          >
            <List className="w-4 h-4 mr-2" /> Transactions
          </Button>
          <Button 
            variant="ghost" size="sm" onClick={() => setActiveTab("withdrawals")}
            className={activeTab === "withdrawals" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-emerald-600"}
          >
            Withdrawals
            {withdrawals.filter((w: any) => w.status === 'pending').length > 0 && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="h-6 w-px bg-slate-200"></div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        
        {/* --- TAB 1: OVERVIEW --- */}
        {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats.totalUsers} color="text-slate-800" />
                    <StatCard title="Total Deposited" value={`PKR ${(stats.totalDeposited/1000000).toFixed(1)}M`} color="text-emerald-600" />
                    <StatCard title="Pending Withdrawals" value={`PKR ${stats.pendingWithdrawals.toLocaleString()}`} color="text-amber-600" />
                    <StatCard title="Total Payouts" value={`PKR ${(stats.totalPayouts/1000000).toFixed(1)}M`} color="text-emerald-700" />
                </div>
                
                <div className="bg-white border border-emerald-100 rounded-xl p-8 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome Back, Admin</h3>
                    <p className="text-slate-500">
                        You have <span className="font-bold text-emerald-600">{stats.recentTransactions.length}</span> total transactions 
                        and <span className="font-bold text-amber-600">{withdrawals.filter((w: any) => w.status === 'pending').length}</span> pending withdrawals.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button onClick={() => setActiveTab("transactions")} variant="outline">View Transactions</Button>
                        <Button onClick={() => setActiveTab("withdrawals")} className="bg-emerald-600 hover:bg-emerald-700">Manage Withdrawals</Button>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: TRANSACTIONS (Uses separate endpoint data) --- */}
        {activeTab === "transactions" && (
            <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="p-6 border-b border-emerald-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Financial Transaction Log</h3>
                        <p className="text-sm text-slate-500">Live record of all Deposits, Commissions, and Payouts</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-mono">
                        Total: {safeTransactions.length}
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-emerald-100 sticky top-0 bg-slate-50 shadow-sm">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {safeTransactions.length > 0 ? (
                                safeTransactions.slice(0, visibleCount).map((tx: any) => {
                                    const style = getTxTypeStyles(tx.type);
                                    return (
                                        <tr key={tx._id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{tx.user?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${style.color}`}>
                                                    {style.icon} {style.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">{tx.description || '-'}</td>
                                            <td className="px-6 py-4 font-bold text-slate-700">PKR {tx.amount?.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`capitalize text-xs font-medium ${
                                                    tx.status === 'approved' ? 'text-emerald-600' : 
                                                    tx.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                                {new Date(tx.createdAt).toLocaleDateString()} <br/>
                                                {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No transactions recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {visibleCount < safeTransactions.length && (
                    <div className="p-4 border-t border-emerald-100 flex justify-center bg-slate-50/50">
                        <Button 
                            variant="outline" size="sm"
                            onClick={() => setVisibleCount(prev => prev + 10)}
                            className="text-slate-600 hover:text-emerald-700 hover:border-emerald-300"
                        >
                            Show Next 10 <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        )}

        {/* --- TAB 3: WITHDRAWALS --- */}
        {activeTab === "withdrawals" && (
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-emerald-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Withdrawal Queue</h2>
                <p className="text-sm text-slate-500">Approve or reject pending payout requests</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search user..." className="pl-9 pr-4 py-2 text-sm border border-emerald-200 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-emerald-50/50 text-emerald-900 font-semibold border-b border-emerald-100">
                  <tr>
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Bank Details</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {withdrawals.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-slate-500">No requests found.</td></tr>
                  ) : (
                    withdrawals.map((req: any) => (
                        <tr key={req._id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">#{req._id.slice(-6)}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{req.user?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-500">
                            <div className="flex flex-col">
                            <span className="text-slate-800 font-medium">{req.bankDetails?.bankName}</span>
                            <span className="text-xs text-slate-400">{req.bankDetails?.accountNumber}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-700">PKR {req.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {req.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            {req.status === 'pending' ? (
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleAction(req._id, 'rejected')} className="h-8 w-8 p-0 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" onClick={() => handleAction(req._id, 'approved')} className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                <Check className="w-4 h-4" />
                                </Button>
                            </div>
                            ) : (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" disabled><MoreHorizontal className="w-4 h-4" /></Button>
                            )}
                        </td>
                        </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}