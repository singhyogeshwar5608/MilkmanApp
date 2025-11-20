import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { SubscriptionPlan } from '../types';
import { User as UserIcon } from 'lucide-react';

const OWNER_EMAIL = 'singh.yogeshwar5608@gmail.com';

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  demo: 'Demo - 3 entries free',
  monthly: 'Monthly - ₹99',
  half_yearly: '6 Months - ₹549',
  yearly: '12 Months - ₹1049',
};

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { subscription, diaryEntries } = useApp();

  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');

  const effectiveLimit = subscription?.entryLimit ?? 3;
  const usedEntries = diaryEntries.length;
  const remainingEntries =
    effectiveLimit === null ? null : Math.max(effectiveLimit - usedEntries, 0);

  const currentPlanLabel = useMemo(() => {
    if (!subscription) return PLAN_LABELS.demo + ' (default)';
    return PLAN_LABELS[subscription.plan];
  }, [subscription]);

  useEffect(() => {
    if (!user) return;
    try {
      const keyBase = `milkman-profile-${user.uid || user.email}`;
      const savedPhone = window.localStorage.getItem(`${keyBase}-phone`);
      const savedAddress = window.localStorage.getItem(`${keyBase}-address`);
      if (savedPhone) setOwnerPhone(savedPhone);
      if (savedAddress) setOwnerAddress(savedAddress);
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const keyBase = `milkman-profile-${user.uid || user.email}`;
      window.localStorage.setItem(`${keyBase}-phone`, ownerPhone.trim());
      window.localStorage.setItem(`${keyBase}-address`, ownerAddress.trim());
      alert('Profile details saved on this device.');
    } catch {
      alert('Could not save profile locally.');
    }
  };

  if (!user) {
    return <p className="text-red-600">You must be logged in to view your profile.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Profile & Subscription</h1>
        <p className="text-gray-600 dark:text-slate-300 mt-1">View your account and subscription details.</p>
      </div>

      <Card title="Your Profile">
        <div className="flex items-start space-x-4">
          <div className="h-14 w-14 rounded-full bg-blue-600/90 dark:bg-slate-700 flex items-center justify-center text-white text-xl flex-shrink-0">
            <UserIcon size={26} />
          </div>
          <form onSubmit={handleSaveProfile} className="flex-1 space-y-2 text-sm text-gray-700 dark:text-slate-100">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
              These details are stored only on this device and help you remember your own contact info.
            </p>
            <div>
              <label className="block text-xs font-medium mb-1">Your mobile number</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., +91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Your address</label>
              <textarea
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street, village / city, state"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
            >
              Save profile
            </button>
          </form>
        </div>
      </Card>

      <Card title="Account">
        <p className="text-sm text-gray-700 dark:text-slate-100">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        {user.email === OWNER_EMAIL && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
            You are the owner/admin of this app.
          </p>
        )}
      </Card>
      <Card title="Current Subscription">
        <p className="text-sm text-gray-700 dark:text-slate-100">
          <span className="font-semibold">Plan:</span> {currentPlanLabel}
        </p>
        {subscription && (
          <>
            <p className="text-sm text-gray-700 dark:text-slate-100 mt-1">
              <span className="font-semibold">Start date:</span> {subscription.startDate}
            </p>
            <p className="text-sm text-gray-700 dark:text-slate-100 mt-1">
              <span className="font-semibold">End date:</span> {subscription.endDate || '—'}
            </p>
          </>
        )}

        {effectiveLimit === null ? (
          <p className="mt-3 text-sm text-green-700 dark:text-green-400 font-medium">
            You have unlimited entries on your current plan.
          </p>
        ) : (
          <p className="mt-3 text-sm text-yellow-800 dark:text-yellow-200">
            You have used <span className="font-semibold">{usedEntries}</span> of{' '}
            <span className="font-semibold">{effectiveLimit}</span> free entries.
            {remainingEntries !== null && remainingEntries > 0 && (
              <span>
                {' '}
                You have <span className="font-semibold">{remainingEntries}</span> left.
              </span>
            )}
            {remainingEntries !== null && remainingEntries <= 0 && (
              <span> Your free entries are finished.</span>
            )}
          </p>
        )}
      </Card>

      <Card title="Available Plans">
        <p className="text-sm text-gray-700 dark:text-slate-100 mb-3">
          To change your plan, please message the owner at{' '}
          <span className="font-mono">{OWNER_EMAIL}</span>. They will update your subscription in the admin panel.
        </p>
        <ul className="space-y-2 text-sm text-gray-800 dark:text-slate-100">
          <li>
            <span className="font-semibold">Demo:</span> 3 entries free to try the app.
          </li>
          <li>
            <span className="font-semibold">Monthly (₹99):</span> Unlimited entries for 1 month.
          </li>
          <li>
            <span className="font-semibold">6 Months (₹549):</span> Unlimited entries for 6 months.
          </li>
          <li>
            <span className="font-semibold">12 Months (₹1049):</span> Unlimited entries for 12 months.
          </li>
        </ul>
      </Card>
    </div>
  );
};
