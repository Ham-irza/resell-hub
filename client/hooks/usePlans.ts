import { useState, useEffect } from 'react';
import type { Plan, UserSubscription, PlanPurchaseResponse } from '@shared/api';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlan, setUserPlan] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        throw new Error('Failed to fetch plans');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/plans/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data);
      } else {
        throw new Error('Failed to fetch user plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user plan');
    } finally {
      setLoading(false);
    }
  };

  const purchasePlan = async (planName: string, paymentMethod: 'wallet' | 'payment_gateway' = 'payment_gateway'): Promise<PlanPurchaseResponse> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/plans/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planName, paymentMethod })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh user plan data
        await fetchUserPlan();
        return data;
      } else {
        throw new Error(data.error || 'Failed to purchase plan');
      }
    } catch (err) {
      throw err;
    }
  };

  const upgradePlan = async (planName: string): Promise<PlanPurchaseResponse> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/plans/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planName })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh user plan data
        await fetchUserPlan();
        return data;
      } else {
        throw new Error(data.error || 'Failed to upgrade plan');
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchUserPlan();
  }, []);

  return {
    plans,
    userPlan,
    loading,
    error,
    purchasePlan,
    upgradePlan,
    refetch: () => {
      fetchPlans();
      fetchUserPlan();
    }
  };
}