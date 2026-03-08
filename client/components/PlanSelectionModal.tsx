import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  CreditCard, 
  ArrowRight, 
  Check, 
  X, 
  Loader2,
  TrendingUp,
  Package,
  Users,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePlans } from '@/hooks/usePlans';
import type { Plan } from '@shared/api';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanPurchased: () => void;
  isForcedSelection?: boolean; // If true, user must select a plan
  currentActivePlan?: string; // Current active plan from Dashboard
}

export function PlanSelectionModal({ 
  isOpen, 
  onClose, 
  onPlanPurchased, 
  isForcedSelection = false,
  currentActivePlan
}: PlanSelectionModalProps) {
  const { plans, purchasePlan, loading, userPlan } = usePlans();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'payment_gateway'>('payment_gateway');
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    // Check if user already has this plan using the currentActivePlan prop from Dashboard
    // Only show this message if currentActivePlan is not null/undefined
    if (currentActivePlan && currentActivePlan === selectedPlan.name) {
      toast({
        title: "Plan Selection",
        description: `You are already on ${selectedPlan.name} plan`,
        variant: "default"
      });
      return;
    }

    try {
      setIsPurchasing(true);
      
      // Always use purchasePlan for plan changes to avoid backend upgrade restrictions
      // The backend upgrade endpoint only allows upgrading to higher-priced plans
      const result = await purchasePlan(selectedPlan.name, paymentMethod);
      
      if (result.success) {
        toast({
          title: "Plan Updated Successfully",
          description: `Your plan has been changed to ${selectedPlan.name}`,
          variant: "default"
        });
        onPlanPurchased();
        onClose();
        
        // Reload the page to show changes on frontend
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Show toast notification instead of alert for better UX
        toast({
          title: "Plan Selection Error",
          description: result.error || "Failed to purchase plan",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Plan purchase error:', err);
      toast({
        title: "Plan Selection Error",
        description: err instanceof Error ? err.message : "Failed to purchase plan",
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const getPlanBenefits = (plan: Plan) => {
    return [
      { icon: '📈', text: `${plan.returnPercentage}% monthly return` },
      { icon: '📦', text: `${plan.totalItems} items to sell` },
      { icon: '💰', text: `${plan.dailyMinSales}-${plan.dailyMaxSales} daily sales` },
      { icon: '⚡', text: '30-day automated selling' }
    ];
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'Starter': return 'border-emerald-200 bg-emerald-50';
      case 'Growth': return 'border-amber-200 bg-amber-50';
      case 'Premium': return 'border-blue-200 bg-blue-50';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  const getPlanButtonColor = (planName: string) => {
    switch (planName) {
      case 'Starter': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'Growth': return 'bg-amber-600 hover:bg-amber-700';
      case 'Premium': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                {isForcedSelection ? 'Select Your Plan' : 'Choose Your Investment Plan'}
              </h2>
              <p className="text-emerald-100 text-sm md:text-base">
                {isForcedSelection ? 'Complete your registration by selecting a plan' : 'Start earning with automated sales'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
              <span className="text-slate-600">Loading plans...</span>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {/* Plan Selection */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 md:mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-h-[60vh] overflow-y-auto">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`p-4 md:p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                        selectedPlan?.name === plan.name 
                          ? getPlanColor(plan.name) + ' ring-2 ring-offset-2 ring-emerald-500' 
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${
                            plan.name === 'Starter' ? 'bg-emerald-100 text-emerald-700' :
                            plan.name === 'Growth' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {plan.name === 'Starter' ? <Package className="w-4 h-4 md:w-5 md:h-5" /> :
                             plan.name === 'Growth' ? <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> :
                             <Users className="w-4 h-4 md:w-5 md:h-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-base md:text-lg">{plan.name}</h4>
                            <p className="text-xs md:text-sm text-slate-500">Investment Plan</p>
                          </div>
                        </div>
                        {selectedPlan?.name === plan.name && (
                          <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-3 md:mb-4">
                        {getPlanBenefits(plan).map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                            <span>{benefit.icon}</span>
                            <span>{benefit.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs md:text-sm text-slate-500">Monthly Return</p>
                          <p className="font-bold text-base md:text-lg text-emerald-600">{plan.returnPercentage}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs md:text-sm text-slate-500">Investment</p>
                          <p className="font-bold text-base md:text-lg">PKR {plan.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              {selectedPlan && (
                <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 md:mb-4">Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-3 md:p-4 rounded-lg border-2 text-left transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm md:text-base">Wallet Balance</p>
                          <p className="text-xs md:text-sm text-slate-500">Pay with available balance</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('payment_gateway')}
                      className={`p-3 md:p-4 rounded-lg border-2 text-left transition-all ${
                        paymentMethod === 'payment_gateway'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm md:text-base">Payment Gateway</p>
                          <p className="text-xs md:text-sm text-slate-500">Secure bank payment</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedPlan && (
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Summary</h3>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                      <p className="text-sm text-slate-600">Selected Plan</p>
                      <p className="font-bold text-base md:text-lg text-slate-800">{selectedPlan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Total Amount</p>
                      <p className="font-bold text-xl md:text-2xl text-emerald-600">
                        PKR {selectedPlan.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
          {isForcedSelection && (
            <p className="text-sm text-slate-500 text-center md:text-left">
              You must select a plan to continue using the platform
            </p>
          )}
          <div className="flex gap-2 md:gap-3 w-full md:w-auto justify-center md:justify-end">
            {isForcedSelection ? (
              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-100 w-full md:w-auto"
                disabled={isPurchasing}
              >
                Skip for now
              </Button>
            ) : (
              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-100 w-full md:w-auto"
                disabled={isPurchasing}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handlePurchase}
              disabled={!selectedPlan || isPurchasing}
              className={`${
                selectedPlan ? getPlanButtonColor(selectedPlan.name) : 'bg-slate-400 cursor-not-allowed'
              } text-white w-full md:w-auto px-6 md:px-8 py-2 text-sm md:text-base font-semibold`}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'wallet' ? 'Pay from Wallet' : 'Pay with Bank'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}