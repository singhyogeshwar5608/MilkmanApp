import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AppUser, Subscription, SubscriptionPlan } from '../types';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

const OWNER_EMAIL = 'singh.yogeshwar5608@gmail.com';

const PLAN_CONFIG: Record<SubscriptionPlan, { label: string; months: number; entryLimit: number | null }> = {
  demo: {
    label: 'Demo - 3 entries free',
    months: 0,
    entryLimit: 3,
  },
  monthly: {
    label: 'Monthly - ₹99',
    months: 1,
    entryLimit: null,
  },
  half_yearly: {
    label: '6 Months - ₹549',
    months: 6,
    entryLimit: null,
  },
  yearly: {
    label: '12 Months - ₹1049',
    months: 12,
    entryLimit: null,
  },
};

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const isAdmin = user?.email === OWNER_EMAIL;

  useEffect(() => {
    if (!isAdmin) return;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AppUser[];
      setUsers(docs);
    });

    const unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Subscription[];
      setSubscriptions(docs);
    });

    return () => {
      unsubUsers();
      unsubSubs();
    };
  }, [isAdmin]);

  const subscriptionByUserId = useMemo(() => {
    const map = new Map<string, Subscription>();
    subscriptions.forEach((s) => {
      map.set(s.userId, s);
    });
    return map;
  }, [subscriptions]);

  const handleUpdatePlan = async (targetUser: AppUser, plan: SubscriptionPlan) => {
    try {
      setLoadingUserId(targetUser.id);
      const cfg = PLAN_CONFIG[plan];
      const now = new Date();
      const startDate = now.toISOString().slice(0, 10);
      let endDate: string | null = null;

      if (cfg.months > 0) {
        const end = new Date(now);
        end.setMonth(end.getMonth() + cfg.months);
        endDate = end.toISOString().slice(0, 10);
      }

      await setDoc(
        doc(db, 'subscriptions', targetUser.id),
        {
          userId: targetUser.id,
          plan,
          entryLimit: cfg.entryLimit,
          startDate,
          endDate,
        },
        { merge: true },
      );
    } catch (err) {
      console.error('Failed to update subscription', err);
      alert('Failed to update subscription. See console for details.');
    } finally {
      setLoadingUserId(null);
    }
  };

  if (!user) {
    return <p className="text-red-600">You must be logged in to view this page.</p>;
  }

  if (!isAdmin) {
    return <p className="text-red-600">Access denied. This page is only for the owner.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">
            Manage user subscriptions. When a user messages you, select their plan here.
          </p>
        </div>
      </div>

      <Card title="Users and Subscriptions">
        {users.length === 0 ? (
          <p className="text-gray-500">No users found yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-left py-2 px-2">Created</th>
                  <th className="text-left py-2 px-2">Current Plan</th>
                  <th className="text-left py-2 px-2">Ends</th>
                  <th className="text-left py-2 px-2">Entry Limit</th>
                  <th className="text-left py-2 px-2">Change Plan</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const sub = subscriptionByUserId.get(u.id);
                  return (
                    <tr key={u.id} className="border-b border-gray-100">
                      <td className="py-2 px-2 font-medium">{u.email}</td>
                      <td className="py-2 px-2 text-gray-600">{u.createdAt?.slice(0, 10) || '-'}</td>
                      <td className="py-2 px-2 text-gray-800">{sub?.plan || 'demo (implicit)'}</td>
                      <td className="py-2 px-2 text-gray-600">{sub?.endDate || '-'}</td>
                      <td className="py-2 px-2 text-gray-600">
                        {sub?.entryLimit === null ? 'Unlimited' : sub?.entryLimit ?? 3}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(PLAN_CONFIG) as SubscriptionPlan[]).map((planKey) => (
                            <Button
                              key={planKey}
                              size="sm"
                              variant={sub?.plan === planKey ? 'primary' : 'secondary'}
                              onClick={() => handleUpdatePlan(u, planKey)}
                              disabled={loadingUserId === u.id}
                            >
                              {PLAN_CONFIG[planKey].label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
