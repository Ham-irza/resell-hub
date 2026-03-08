import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlans } from '@/hooks/usePlans';
import { PlanSelectionModal } from './PlanSelectionModal';
import type { UserSubscription } from '@shared/api';

interface PlanManagementProps {
  userPlan: UserSubscription | null;
  onPlanUpdated: () => void;
}

export function PlanManagement({ userPlan, onPlanUpdated }: PlanManagementProps) {
  const { upgradePlan, loading } = usePlans();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'expired': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'inactive': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getPlanStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleUpgrade = async (planName: string) => {
    try {
      setIsUpgrading(true);
      const result = await upgradePlan(planName);
      
      if (result.success) {
        onPlanUpdated();
        setShowUpgradeModal(false);
      } else {
        alert(result.error || 'Failed to upgrade plan');
      }
    } catch (err) {
      console.error('Plan upgrade error:', err);
      alert(err instanceof Error ? err.message : 'Failed to upgrade plan');
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active Plan';
      case 'expired': return 'Expired Plan';
      case 'inactive': return 'No Active Plan';
      default: return 'Unknown Status';
    }
  };

  const getButtonText = (status: string, currentPlan: string | null) => {
    if (status !== 'active') {
      return 'Get Started';
    }
    return 'Change Plan';
  };

  if (!userPlan) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Subscription Plan</h3>
          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 mb-4">No active subscription plan</p>
          <p className="text-sm text-slate-400">Choose a plan to start earning with automated sales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Subscription Plan</h3>
            <p className="text-sm text-slate-500">Manage your investment plan</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowUpgradeModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={loading || isUpgrading}
        >
          <Zap className="w-4 h-4 mr-2" />
          {getButtonText(userPlan.subscriptionStatus, userPlan.currentPlan)}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Plan Status */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            {getPlanStatusIcon(userPlan.subscriptionStatus)}
            <span className="text-sm font-medium text-slate-600">Status</span>
          </div>
          <p className={`text-sm font-semibold px-2 py-1 rounded-full border ${getPlanStatusColor(userPlan.subscriptionStatus)}`}>
            {getStatusText(userPlan.subscriptionStatus)}
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">Current Plan</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {userPlan.currentPlan || 'No Plan'}
          </p>
        </div>

        {/* Activated Date */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">Activated</span>
          </div>
          <p className="text-sm text-slate-800">
            {formatDate(userPlan.planActivatedAt)}
          </p>
        </div>

        {/* Expires Date */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">Expires</span>
          </div>
          <p className="text-sm text-slate-800">
            {formatDate(userPlan.planExpiresAt)}
          </p>
        </div>
      </div>

      {/* Plan Benefits */}
      {userPlan.subscriptionStatus === 'active' && (
        <div className="bg-gradient-to-r from-emerald-50 to-slate-50 rounded-lg p-4 border border-emerald-200">
          <h4 className="font-semibold text-slate-800 mb-2">Plan Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Wallet className="w-4 h-4" />
              <span>Automated sales</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CreditCard className="w-4 h-4" />
              <span>Daily profits</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4" />
              <span>Monthly returns</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className="w-4 h-4" />
              <span>30-day cycle</span>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <PlanSelectionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onPlanPurchased={onPlanUpdated}
        currentActivePlan={userPlan?.currentPlan}
      />
    </div>
  );
}
