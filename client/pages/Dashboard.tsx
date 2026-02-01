import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Wallet, TrendingUp, Users, Bell, 
  Check, X, ShieldCheck, Loader2, Copy, LogOut, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter'; 

// --- CONFIGURATION ---
// 1. Try to get URL from .env (Vite standard)
// 2. Fallback to current browser URL (Safe default)
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// --- CONSTANTS ---
const PLANS = [
  { name: "Starter", price: 50000, returnRate: "4%", dailySales: "1 item" },
  { name: "Growth", price: 100000, returnRate: "4.5%", dailySales: "1-2 items" },
  { name: "Premium", price: 200000, returnRate: "5%", dailySales: "2+ items" },
];

// --- COMPONENTS ---

// 1. Notification Bell Component (Fetches on Load + Working Mark Read)
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derived state: Do we have unread messages?
  const hasUnread = notifications.some((n: any) => !n.isRead);

  // FETCH FUNCTION
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: { 'x-auth-token': token || '' }
      });
      if(res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  // MARK READ FUNCTION
  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Call Backend
      await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: { 'x-auth-token': token || '' }
      });

      // 2. Update Local State (Instant feedback: Remove red dot)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
    } catch (err) {
      console.error("Failed to mark read");
    }
  };

  // Toggle dropdown
  const toggleOpen = () => {
    // Optional: Re-fetch when opening to ensure latest data
    if(!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  // LIFECYCLE: Fetch on Mount & Click Outside Handler
  useEffect(() => {
    // 1. FETCH IMMEDIATELY ON LOAD (To show Red Dot)
    fetchNotifications();

    // 2. Click Outside Logic
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
      <button 
        onClick={toggleOpen}
        className="relative p-2 rounded-full text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        
        {/* CONDITIONAL RED DOT: Shows immediately if unread exists */}
        {hasUnread && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-50/50 p-3 border-b border-emerald-100 flex justify-between items-center">
            <h4 className="font-bold text-emerald-900 text-sm">Notifications</h4>
            
            {/* Mark Read Button (Only visible if unread items exist) */}
            {hasUnread && (
                <button 
                    onClick={markAllRead}
                    className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline focus:outline-none"
                >
                    Mark all read
                </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No notifications yet.</div>
            ) : (
                notifications.map((notif: any) => (
                    <div 
                        key={notif._id} 
                        className={`p-4 border-b border-slate-50 transition-colors ${!notif.isRead ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}
                    >
                        <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm leading-snug ${!notif.isRead ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                                {notif.message}
                            </p>
                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

// 2. Payment Modal
const PaymentModal = ({ plan, isOpen, onClose, onSuccess }: any) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !plan) return null;

  const handlePayment = async () => {
    setStep(2); 
    setTimeout(async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch('/api/investments/buy', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token || '' 
          },
          body: JSON.stringify({ planName: plan.name })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Purchase Failed");
        
        setStep(3); 
        setTimeout(() => onSuccess(), 1500);

      } catch (err: any) {
        alert(err.message);
        onClose();
      } finally {
        setIsLoading(false);
      }
    }, 2000); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100">
        <div className="bg-emerald-900 p-6 text-white flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Bank Alfalah Gateway
            </h3>
            <p className="text-emerald-200 text-sm mt-1">Secure Transaction</p>
          </div>
          <button onClick={onClose} className="hover:text-emerald-300"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
               <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-slate-500">Purchasing Package:</p>
                <div className="flex justify-between items-end">
                  <h4 className="font-bold text-lg text-emerald-900">{plan.name}</h4>
                  <span className="font-bold text-emerald-600">PKR {plan.price.toLocaleString()}</span>
                </div>
              </div>
              <Button onClick={handlePayment} className="w-full bg-red-600 hover:bg-red-700 text-white mt-4">
                Proceed to Pay
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="text-center py-8">
               <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
               <p className="text-slate-600">Verifying OTP...</p>
            </div>
          )}
          {step === 3 && (
            <div className="text-center py-8">
               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800">Payment Successful!</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Plan Selection View
const PlanSelectionView = ({ onSelectPlan }: any) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Activate Your Account</h1>
        <p className="text-slate-600">Select a package to start earning.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan, idx) => (
          <div key={idx} className={`bg-white p-8 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-sm hover:shadow-lg ${plan.name === 'Growth' ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">PKR {plan.price.toLocaleString()}</span>
              <p className="text-emerald-600 font-medium mt-1">{plan.returnRate} Return</p>
            </div>
            <Button onClick={() => onSelectPlan(plan)} className={`w-full ${plan.name === 'Growth' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
              Select Plan
            </Button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 4. Active Dashboard View
const ActiveDashboard = ({ investment, user, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false); // For Referral Copy

  const handleWithdraw = async () => {
    if(!withdrawAmount) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/wallet/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
            body: JSON.stringify({ 
                amount: Number(withdrawAmount), 
                bankName: "Bank Alfalah", 
                accountNumber: "1234", 
                accountTitle: user.name 
            })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.msg);
        setMsg(`Success! New Balance: ${data.balance}`);
        setWithdrawAmount("");
    } catch(err: any) {
        setMsg(err.message);
    }
  };

  const handleCopyReferral = () => {
    // USES THE CONFIGURABLE APP_URL
    const link = `${APP_URL}/auth?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = (investment.itemsSold / investment.totalStock) * 100;
  const currentBalance = user.walletBalance || 0; 
  const plan = investment.plan || { name: 'Unknown', returnPercentage: 0 };

  return (
    <div className="flex h-screen bg-emerald-50/30">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-emerald-100 hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-emerald-100">
           <div className="text-xl font-bold text-emerald-800 flex items-center gap-2">
             <TrendingUp className="w-6 h-6" /> ResellHub
           </div>
        </div>
        
        <div className="p-4 space-y-2 flex-1">
           {['overview', 'wallet', 'referrals'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               {tab === 'overview' && <LayoutDashboard size={18} />}
               {tab === 'wallet' && <Wallet size={18} />}
               {tab === 'referrals' && <Users size={18} />}
               {tab}
             </button>
           ))}
        </div>

        <div className="p-4 border-t border-emerald-100 space-y-4">
             <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={18} /> Log Out
             </button>

             <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{plan.name} Plan</p>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER BAR (Mobile Toggle + Notification Bell) */}
        <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-end px-8 z-10">
             <NotificationBell />
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
                
                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-700">Sales Simulation</h3>
                        <p className="text-sm text-slate-500">Auto-selling 1-2 items per day</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex gap-2 items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Active
                    </span>
                </div>
                
                <div className="mb-2 flex justify-between text-sm font-medium">
                    <span>{Math.round(progress)}% Complete</span>
                    <span>{investment.itemsSold} / {investment.totalStock} Sold</span>
                </div>
                
                <div className="h-4 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="mt-6 flex gap-4 text-sm">
                    <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                            <span className="text-slate-500 block text-xs">Accumulated Profit</span>
                            <span className="font-bold text-emerald-700">PKR {Math.round(investment.accumulatedReturn)}</span>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg">
                            <span className="text-slate-500 block text-xs">Total Stock</span>
                            <span className="font-bold text-slate-700">{investment.totalStock} Units</span>
                    </div>
                </div>
                </div>
            </div>
            )}

            {activeTab === 'wallet' && (
                <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold mb-6">Wallet</h3>
                    <div className="bg-emerald-50 p-4 rounded-lg mb-6 flex justify-between items-center">
                        <span>Available Balance</span>
                        <span className="text-2xl font-bold text-emerald-700">PKR {currentBalance.toLocaleString()}</span>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Withdraw Amount</label>
                        <input 
                            type="number" 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                            placeholder="Min: 1000"
                        />
                        <Button onClick={handleWithdraw} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            Request Withdrawal
                        </Button>
                        {msg && <p className="text-center text-sm mt-2 text-emerald-600">{msg}</p>}
                    </div>
                </div>
            )}

            {activeTab === "referrals" && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-800">Referral Program</h2>
                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                <p className="text-slate-600 mb-4">Share this link to earn commission on every new reseller.</p>
                <div className="flex gap-2">
                    {/* USES APP_URL CONSTANT */}
                    <code className="flex-1 bg-slate-100 p-3 rounded-lg text-emerald-800 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap border border-slate-200">
                    {APP_URL}/auth?ref={user.referralCode}
                    </code>
                    
                    <Button 
                        variant="outline" 
                        onClick={handleCopyReferral}
                        className={`w-28 transition-all duration-300 ${copied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : ""}`}
                    >
                        {copied ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
                        ) : (
                            <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> Copy</span>
                        )}
                    </Button>
                </div>
                </div>
            </div>
            )}
        </main>
      </div>
    </div>
  );
};

// --- MAIN WRAPPER ---
export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeInv, setActiveInv] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { handleLogout(); return; }

    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/user', { headers: { 'x-auth-token': token } });
      if(!userRes.ok) throw new Error("Session Invalid");

      const userData = await userRes.json();
      setUser(userData);

      const invRes = await fetch('/api/investments/active', { headers: { 'x-auth-token': token } });
      const invData = await invRes.json();
      setActiveInv(invData);
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-slate-500">Verifying Secure Session...</p>
        </div>
    </div>
  );

  return (
    <>
      {!activeInv ? (
        <div className="relative">
            <div className="absolute top-4 right-4 z-50">
                <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:bg-red-50 gap-2">
                    <LogOut size={16} /> Logout
                </Button>
            </div>
            <PlanSelectionView onSelectPlan={setSelectedPlan} />
        </div>
      ) : (
        <ActiveDashboard investment={activeInv} user={user} onLogout={handleLogout} />
      )}

      <PaymentModal 
        plan={selectedPlan} 
        isOpen={!!selectedPlan} 
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => { setSelectedPlan(null); loadData(); }}
      />
    </>
  );
}