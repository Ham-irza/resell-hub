import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: ''
  });

  // Check URL for referral code (e.g. ?ref=ali123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setFormData(prev => ({ ...prev, referralCode: ref }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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
      {/* Left Side (Visuals) */}
      <div className="hidden lg:flex w-1/2 bg-emerald-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-2xl font-bold mb-8">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            ResellHub
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Start your journey to <br/> financial freedom today.
          </h1>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-emerald-50/30">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-emerald-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
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

            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password" placeholder="••••••••" required
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

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

            <Button disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base mt-6">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-emerald-50">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
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