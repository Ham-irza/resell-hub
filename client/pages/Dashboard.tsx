import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, TrendingUp, Users, Bell, 
  Check, X, ShieldCheck, Loader2, Copy, LogOut, Clock,
  Package, ShoppingBag, Minus, Plus, ShoppingCart,
  ClipboardList, Search, Zap, ArrowRight, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter'; 

// --- CONFIGURATION ---
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

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

// 2. Product Purchase Modal (For buying individual items)
const ProductPurchaseModal = ({ product, isOpen, onClose, onSuccess }: any) => {
    const [quantity, setQuantity] = useState(1);
    const [step, setStep] = useState(1); 
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    if (!isOpen || !product) return null;

    const total = product.price * quantity;

    const handlePurchase = async () => {
        setStep(2);
        try {
            const token = localStorage.getItem('token');
            
            // First, initiate payment through the payment gateway
            const paymentRes = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token || '' 
                },
                body: JSON.stringify({ 
                    productId: product._id, 
                    quantity: quantity,
                    amount: total,
                    description: `Purchase: ${product.name} x${quantity}`
                })
            });

            const paymentData = await paymentRes.json();

            if(!paymentRes.ok) {
                throw new Error(paymentData.msg || paymentData.error || "Payment initiation failed");
            }

            // If it's a hosted redirect (LIVE mode), redirect to payment page
            if (paymentData.type === 'HOSTED_REDIRECT' && paymentData.formData) {
                setIsRedirecting(true);
                
                // According to Alfa documentation, redirect with JSON data as query param
                const redirectUrl = `${paymentData.formData.apiUrl}/Checkout?data=${encodeURIComponent(JSON.stringify(paymentData.formData))}`;
                window.location.href = redirectUrl;
                return;
            }

            // For TEST mode, just create the order directly
            if (paymentData.success) {
                // Order was already created in the backend
                setStep(3);
                setTimeout(() => {
                    onSuccess();
                    setStep(1);
                    setQuantity(1);
                }, 2000);
            }

        } catch (err: any) {
            alert(err.message || "Payment Failed");
            onClose();
            setStep(1);
        }
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
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Expected Profit ({product.roi || 0}%)</span>
                                        <span className="font-bold text-emerald-600">PKR {Math.round(total * (product.roi || 0) / 100).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handlePurchase} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base shadow-md hover:shadow-lg transition-all">
                                Pay PKR {total.toLocaleString()}
                            </Button>
                            <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                                <Zap className="w-3 h-3" /> Auto-sells in 30 days!
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
                            <p className="text-slate-500 text-sm mt-2">Your items will auto-sell within 30 days.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 3. Main Dashboard Component
const UserDashboardContent = ({ user, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState("home");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [activeOrders, setActiveOrders] = useState([]);
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Close sidebar when changing tabs on mobile
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

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

  // Fetch All Orders
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

  // Fetch Active Auto-Sell Orders
  const fetchActiveOrders = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/store/active-orders', { 
            headers: { 'x-auth-token': token || '' } 
        });
        if(res.ok) {
            const data = await res.json();
            setActiveOrders(data);
        }
    } catch(err) {
        console.error("Failed to fetch active orders", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchActiveOrders();
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

  const refreshData = () => {
      setSelectedProduct(null); 
      fetchProducts(); 
      fetchOrders();
      fetchActiveOrders();
  };

  const currentBalance = user.walletBalance || 0; 

  // Calculate stats for welcome dashboard
  const completedOrders = orders.filter((o: any) => o.status === 'completed').length;
  const totalEarnings = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + (o.expectedProfit || 0), 0);

  return (
    <div className="flex h-screen bg-emerald-50/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-emerald-100 hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-emerald-100">
           <div className="text-xl font-bold text-emerald-800 flex items-center gap-2">
             <img src="/src/assets/egrocifylogo.png" alt="eGrocify" className="h-8 w-auto" />
           </div>
        </div>
        
        <div className="p-4 space-y-2 flex-1">
           <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'home' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <TrendingUp size={18} /> Home
           </button>
           <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'products' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <ShoppingCart size={18} /> Products
           </button>
           <button onClick={() => setActiveTab('auto-sell')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'auto-sell' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <Zap size={18} /> Auto-Sell {activeOrders.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{activeOrders.length}</span>}
           </button>
           <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === 'orders' ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>
               <ClipboardList size={18} /> Orders
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
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-8 z-10">
             <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab === 'home' ? 'Welcome' : activeTab.replace('-', ' ')}</h2>
             <NotificationBell />
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
            
            {/* --- TAB 0: HOME / WELCOME --- */}
            {activeTab === 'home' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-8 rounded-xl shadow-lg">
                        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
                        <p className="text-emerald-100">Track your earnings and manage your reselling business all in one place.</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-sm text-slate-500">Wallet Balance</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">PKR {currentBalance.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-amber-600" />
                                </div>
                                <span className="text-sm text-slate-500">Active Orders</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-700">{activeOrders.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm text-slate-500">Completed Orders</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{completedOrders}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-sm text-slate-500">Total Earnings</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-700">PKR {Math.round(totalEarnings).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Quick Actions / Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Products Card */}
                        <div 
                            onClick={() => setActiveTab('products')}
                            className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-emerald-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">Browse Products</h3>
                            <p className="text-sm text-slate-500">Explore products to resell. Choose from various categories and price ranges.</p>
                        </div>

                        {/* Auto-Sell Card */}
                        <div 
                            onClick={() => setActiveTab('auto-sell')}
                            className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-amber-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">Auto-Sell Orders</h3>
                            <p className="text-sm text-slate-500">Track your active orders. Products sell automatically within 30 days.</p>
                        </div>

                        {/* Wallet Card */}
                        <div 
                            onClick={() => setActiveTab('wallet')}
                            className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">Withdraw Earnings</h3>
                            <p className="text-sm text-slate-500">Withdraw your earnings to your bank account. Minimum PKR 1,000.</p>
                        </div>

                        {/* Referrals Card */}
                        <div 
                            onClick={() => setActiveTab('referrals')}
                            className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">Refer Friends</h3>
                            <p className="text-sm text-slate-500">Share your referral link and earn commissions from new registrants.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 1: PRODUCTS --- */}
            {activeTab === 'products' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                    <p className="text-amber-800 text-sm">
                        <Zap className="w-4 h-4 inline mr-2" />
                        Buy products below. Your items will automatically sell within 30 days and you'll receive your profit in your wallet!
                    </p>
                </div>
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
                                        <div className="flex items-center gap-3">
                                          <h3 className="font-bold text-slate-800 line-clamp-1" title={prod.name}>{prod.name}</h3>
                                          {prod.trendy && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Trendy</span>
                                          )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                          <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">PKR {prod.price.toLocaleString()}</span>
                                          <span className="text-xs text-slate-400">ROI: {prod.roi ?? 0}%</span>
                                        </div>
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

            {/* --- TAB 2: AUTO-SELL ORDERS --- */}
            {activeTab === 'auto-sell' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-2">Active Auto-Sell Orders</h3>
                        <p className="text-emerald-200">Track your products that are currently being sold automatically over 30 days.</p>
                    </div>

                    {activeOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-emerald-100">
                            <Zap className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                            <p className="text-slate-500">No active auto-sell orders.</p>
                            <Button onClick={() => setActiveTab('products')} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                                Browse Products
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {activeOrders.map((order: any) => {
                                const progress = (order.itemsSold / order.totalQuantity) * 100;
                                return (
                                    <div key={order._id} className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                {order.productImage ? (
                                                    <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-full h-full p-3 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{order.productName}</h4>
                                                <p className="text-sm text-slate-500">Quantity: {order.totalQuantity} | ROI: {order.roi}%</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Zap className="w-3 h-3" /> Auto-Selling
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500">Sold</p>
                                                <p className="font-bold text-emerald-600">{order.itemsSold} / {order.totalQuantity}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-2 flex justify-between text-sm font-medium">
                                            <span>{Math.round(progress)}% Complete</span>
                                            <span className="text-slate-500">30 days cycle</span>
                                        </div>
                                        
                                        <div className="h-3 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB 3: MY ORDERS --- */}
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
                                                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        order.status === 'auto-selling' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        order.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
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
    <UserDashboardContent user={user} onLogout={handleLogout} />
  );
}
