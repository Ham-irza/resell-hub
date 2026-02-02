import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Wallet, TrendingUp, Users, Bell, 
  Check, X, ShieldCheck, Loader2, Copy, LogOut, Clock,
  Package, CreditCard, ShoppingBag, Minus, Plus, ShoppingCart,
  ClipboardList, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter'; 

// --- CONFIGURATION ---
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// --- CONSTANTS ---
const PLANS = [
  { name: "Starter", price: 50000, returnRate: "4%", dailySales: "1 item" },
  { name: "Growth", price: 100000, returnRate: "4.5%", dailySales: "1-2 items" },
  { name: "Premium", price: 200000, returnRate: "5%", dailySales: "2+ items" },
];

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
      const res = await fetch('/api/notifications', {
        headers: { 'x-auth-token': token || '' }
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
      <button 
        onClick={toggleOpen}
        className="relative p-2 rounded-full text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {hasUnread && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-50/50 p-3 border-b border-emerald-100 flex justify-between items-center">
            <h4 className="font-bold text-emerald-900 text-sm">Notifications</h4>
            {hasUnread && (
                <button onClick={markAllRead} className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline focus:outline-none">
                    Mark all read
                </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {safeNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No notifications yet.</div>
            ) : (
                safeNotifications.map((notif: any) => (
                    <div key={notif._id} className={`p-4 border-b border-slate-50 transition-colors ${!notif.isRead ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                        <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm leading-snug ${!notif.isRead ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{notif.message}</p>
                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
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

// 2. Plan Payment Modal (For buying Investment Plans)
const PlanPaymentModal = ({ plan, isOpen, onClose, onSuccess }: any) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100">
        <div className="bg-emerald-900 p-6 text-white flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Bank Alfalah Gateway
            </h3>
            <p className="text-emerald-200 text-sm mt-1">Secure Plan Purchase</p>
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
                Pay with Bank Alfalah
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="text-center py-8">
               <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
               <p className="text-slate-600">Processing Payment...</p>
            </div>
          )}
          {step === 3 && (
            <div className="text-center py-8">
               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800">Transaction Successful!</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Product Purchase Modal (For buying individual items)
const ProductPurchaseModal = ({ product, isOpen, onClose, onSuccess }: any) => {
    const [quantity, setQuantity] = useState(1);
    const [step, setStep] = useState(1); 
    
    if (!isOpen || !product) return null;

    const total = product.price * quantity;

    const handlePurchase = async () => {
        setStep(2);
        setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                
                // --- CALL REAL BACKEND ---
                const res = await fetch('/api/store/buy', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-auth-token': token || '' 
                    },
                    body: JSON.stringify({ 
                        productId: product._id, 
                        quantity: quantity 
                    })
                });

                const data = await res.json();

                if(!res.ok) {
                    throw new Error(data.msg || "Purchase failed");
                }

                setStep(3);
                setTimeout(() => {
                    onSuccess(); // Updates UI
                    setStep(1);
                    setQuantity(1);
                }, 2000);
            } catch (err: any) {
                alert(err.message || "Payment Failed");
                onClose();
                setStep(1);
            }
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
                <div className="bg-emerald-900 p-5 text-white flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" /> Bank Alfalah Checkout
                    </h3>
                    <button onClick={onClose} className="hover:text-emerald-300"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <>
                            <div className="flex gap-4 mb-6">
                                <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                    {(product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 line-clamp-2">{product.name}</h4>
                                    <p className="text-sm text-emerald-600 font-medium mt-1">PKR {product.price.toLocaleString()}</p>
                                    <p className="text-xs text-slate-400 mt-1">{product.quantity} in stock</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-600">Quantity</span>
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-md p-1">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold w-6 text-center">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-3">
                                    <span className="font-bold text-slate-700">Total Amount</span>
                                    <span className="font-bold text-xl text-emerald-700">PKR {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button onClick={handlePurchase} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base shadow-md hover:shadow-lg transition-all">
                                Pay PKR {total.toLocaleString()}
                            </Button>
                            <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Secure Payment via Bank Alfalah
                            </p>
                        </>
                    )}

                    {step === 2 && (
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-slate-800">Processing Payment</h4>
                            <p className="text-slate-500 text-sm mt-2">Please wait while we contact the bank...</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                                <Check className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-800">Order Successful!</h3>
                            <p className="text-slate-500 text-sm mt-2">You will receive a confirmation shortly.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 4. Plan Selection View (For new users)
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

// 5. Active Dashboard View
// IMPORTANT: This component does NOT handle Plan Payments. It only handles Product Purchases.
const ActiveDashboard = ({ investment, user, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState("products");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); 
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch Products
  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/products', { 
            headers: { 'x-auth-token': token || '' } 
        });
        if(res.ok) {
            const data = await res.json();
            setProducts(data);
        }
    } catch(err) {
        console.error("Failed to fetch products", err);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/store/orders', { 
            headers: { 'x-auth-token': token || '' } 
        });
        if(res.ok) {
            const data = await res.json();
            setOrders(data);
        }
    } catch(err) {
        console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders(); // Load orders on mount
  }, []);

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
    const link = `${APP_URL}/auth?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // REFRESH DATA AFTER PURCHASE (Updates Stock & Order History)
  const refreshData = () => {
      setSelectedProduct(null); 
      fetchProducts(); 
      fetchOrders();
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
           <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'products' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <Package size={18} /> Products
           </button>
           <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'orders' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <ClipboardList size={18} /> My Orders
           </button>
           <button onClick={() => setActiveTab('plan')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'plan' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <CreditCard size={18} /> My Plan
           </button>
           <button onClick={() => setActiveTab('wallet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'wallet' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <Wallet size={18} /> Wallet
           </button>
           <button onClick={() => setActiveTab('referrals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'referrals' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <Users size={18} /> Referrals
           </button>
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
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-8 z-10">
             <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
             <NotificationBell />
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
            
            {/* --- TAB 1: PRODUCTS --- */}
            {activeTab === 'products' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                         <div className="col-span-full text-center py-12 text-slate-400">
                             <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                             <p>No products available yet.</p>
                         </div>
                    ) : (
                        products.map((prod: any) => (
                            <div key={prod._id} className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col">
                                <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                     {/* Base64 / URL Image Support */}
                                     {(prod.image && (prod.image.startsWith('http') || prod.image.startsWith('data:'))) ? (
                                         <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                     ) : (
                                         <Package className="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-300" />
                                     )}
                                     
                                     <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-emerald-700 shadow-sm">
                                         {prod.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                     </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-800 line-clamp-1" title={prod.name}>{prod.name}</h3>
                                        <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">PKR {prod.price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">{prod.description || "No description available."}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                        <span>Inventory: {prod.quantity}</span>
                                        <Button 
                                            size="sm" 
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-2"
                                            onClick={() => setSelectedProduct(prod)}
                                            disabled={prod.quantity <= 0}
                                        >
                                            <ShoppingCart className="w-3 h-3" /> Buy Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
            )}

            {/* --- TAB 2: MY ORDERS --- */}
            {activeTab === 'orders' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-emerald-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Order History</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Search orders..." className="pl-9 pr-4 py-2 text-sm border border-emerald-200 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-700 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Quantity</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-50">
                                    {orders.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-12 text-slate-400">No orders placed yet.</td></tr>
                                    ) : (
                                        orders.map((order: any) => (
                                            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                                                        {order.productImage ? (
                                                            <img src={order.productImage} className="w-full h-full object-cover" />
                                                        ) : <Package className="w-full h-full p-2 text-slate-300" />}
                                                    </div>
                                                    {order.productName}
                                                </td>
                                                <td className="px-6 py-4">{order.quantity}</td>
                                                <td className="px-6 py-4 font-bold text-emerald-700">PKR {order.totalAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}>
                                                        {order.status || 'Processing'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 3: MY PLAN --- */}
            {activeTab === 'plan' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                     <h3 className="text-2xl font-bold mb-1">{plan.name} Plan</h3>
                     <p className="text-emerald-200 mb-6">Active Subscription</p>
                     
                     <div className="grid grid-cols-2 gap-8 border-t border-emerald-700/50 pt-6">
                         <div>
                             <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Daily Sales</p>
                             <p className="text-lg font-semibold">{plan.dailySales || '1-2 items'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Return Rate</p>
                             <p className="text-lg font-semibold">{plan.returnRate || '4%'} Monthly</p>
                         </div>
                     </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-700">Sales Simulation</h3>
                            <p className="text-sm text-slate-500">Auto-selling process status</p>
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
                        <div className="bg-emerald-50 px-4 py-3 rounded-lg flex-1">
                                <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Accumulated Profit</span>
                                <span className="text-xl font-bold text-emerald-700">PKR {Math.round(investment.accumulatedReturn)}</span>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 rounded-lg flex-1">
                                <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Remaining Stock</span>
                                <span className="text-xl font-bold text-slate-700">{investment.totalStock - investment.itemsSold}</span>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* --- TAB 4: WALLET --- */}
            {activeTab === 'wallet' && (
                <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold mb-6">Wallet Management</h3>
                    <div className="bg-emerald-50 p-6 rounded-xl mb-6 flex justify-between items-center border border-emerald-100">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Available Balance</p>
                            <span className="text-3xl font-bold text-emerald-700">PKR {currentBalance.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
                            <Wallet />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Withdraw Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">PKR</span>
                            <input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full pl-12 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                                placeholder="Min: 1000"
                            />
                        </div>
                        <Button onClick={handleWithdraw} className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg">
                            Request Withdrawal
                        </Button>
                        {msg && <p className="text-center text-sm mt-2 text-emerald-600 font-medium bg-emerald-50 p-2 rounded">{msg}</p>}
                    </div>
                </div>
            )}

            {/* --- TAB 5: REFERRALS --- */}
            {activeTab === "referrals" && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-xl border border-emerald-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <Users className="w-8 h-8"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Refer & Earn</h2>
                    <p className="text-slate-600 mb-6">Share your unique link. Earn commission on every new reseller who joins via your link.</p>
                    
                    <div className="flex gap-2 items-center justify-center max-w-lg mx-auto">
                        <code className="flex-1 bg-slate-50 p-3 rounded-lg text-emerald-800 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap border border-slate-200 text-left">
                        {APP_URL}/auth?ref={user.referralCode}
                        </code>
                        
                        <Button 
                            variant="outline" 
                            onClick={handleCopyReferral}
                            className={`w-32 transition-all duration-300 ${copied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : ""}`}
                        >
                            {copied ? (
                                <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
                            ) : (
                                <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> Copy Link</span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
            )}
        </main>
      </div>

      {/* MODALS */}
      {/* Product Purchase Modal is inside ActiveDashboard, used for buying items */}
      <ProductPurchaseModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onSuccess={refreshData}
      />
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

      <PlanPaymentModal 
        plan={selectedPlan} 
        isOpen={!!selectedPlan} 
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => { setSelectedPlan(null); loadData(); }}
      />
    </>
  );
}