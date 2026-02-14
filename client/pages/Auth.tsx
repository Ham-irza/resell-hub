import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import logo from "../src/assets/egrocifylogo.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // New States for Password UX
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: '',
    store: 'none'
  });

  const [stores, setStores] = useState<any[]>([]);

  // Check URL for referral code (e.g. ?ref=ali123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setFormData(prev => ({ ...prev, referralCode: ref }));
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/stores');
        if (res.ok) {
          const data = await res.json();
          setStores(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load stores');
      }
    };
    fetchStores();
    const iv = setInterval(fetchStores, 10000);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // --- VALIDATION: Check Passwords Match ---
    if (!isLogin && formData.password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      // --- STEP 1: AUTHENTICATE ---
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Authentication failed");
      }

      // Save Token
      localStorage.setItem('token', data.token);

      // --- STEP 2: CHECK ROLE (Fetch User Profile) ---
      const userRes = await fetch('/api/auth/user', {
        headers: { 'x-auth-token': data.token }
      });
      const userData = await userRes.json();

      // --- ROLE BASED REDIRECT ---
      if (userData.role === 'admin') {
        window.location.href = '/dashboard-admin';
      } else {
        window.location.href = '/dashboard';
      }

    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side (Visuals) - Hidden on mobile, shown on large screens */}
      <div className="hidden lg:flex w-1/2 bg-emerald-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-2xl font-bold mb-8">
            <img src={logo} alt="eGrocify" className="h-10 w-auto" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Start your journey to <br/> financial freedom today.
          </h1>
        </div>
      </div>

      {/* Right Side (Form) - Full width on mobile */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-emerald-50/30">
        <div className="w-full max-w-md space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-emerald-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Ali Khan" required
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="0300 1234567" required
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email" placeholder="ali@example.com" required
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* PASSWORD FIELD WITH TOGGLE */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pr-10" // Make room for icon
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (SIGNUP ONLY) */}
            {!isLogin && (
                <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                    <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    />
                    {/* Reuse the same toggle state for better UX */}
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label>Referral Code (Optional)</Label>
                <Input 
                  placeholder="e.g. ali-khan-123" 
                  value={formData.referralCode}
                  onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                />
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label>Select Store (Optional)</Label>
                <select
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="none">None</option>
                  {stores.map((s: any) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <Button disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base mt-6">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-emerald-50">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); setConfirmPassword(""); }}
                className="ml-2 font-semibold text-emerald-600 hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}