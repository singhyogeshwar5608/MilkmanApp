import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Users, TrendingUp, Droplet, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { customers, diaryEntries, subscription } = useApp();

  const effectiveLimit = subscription?.entryLimit ?? 3;
  const usedEntries = diaryEntries.length;
  const remainingEntries =
    effectiveLimit === null ? null : Math.max(effectiveLimit - usedEntries, 0);

  const stats = useMemo(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthEntries = diaryEntries.filter((entry) => entry.date.startsWith(currentMonth));

    const totalRevenue = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalQuantity = monthEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const deliveryCount = monthEntries.filter((entry) => entry.delivered).length;

    // Today's stats
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = diaryEntries.filter((entry) => entry.date === today);
    const todayRevenue = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalCustomers: customers.length,
      monthlyRevenue: totalRevenue,
      monthlyQuantity: totalQuantity,
      monthlyDeliveries: deliveryCount,
      todayRevenue,
      todayDeliveries: todayEntries.length,
    };
  }, [customers, diaryEntries]);

  const recentDeliveries = useMemo(() => {
    return diaryEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [diaryEntries]);

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-gray-600 dark:text-slate-300 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {effectiveLimit !== null && (
        <div className="mt-4">
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-100">
            <p className="font-medium">
              Demo usage: {usedEntries} of {effectiveLimit} free entries used.
            </p>
            {remainingEntries > 0 ? (
              <p className="mt-1">
                You have <span className="font-semibold">{remainingEntries}</span> free entries left.
              </p>
            ) : (
              <p className="mt-1">
                Your free entries are finished. Please contact the owner to upgrade your subscription.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalCustomers}</p>
            </div>
            <Users className="text-blue-600" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-900 mt-1">₹{stats.monthlyRevenue.toFixed(0)}</p>
            </div>
            <TrendingUp className="text-green-600" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Monthly Quantity</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.monthlyQuantity.toFixed(0)} L</p>
            </div>
            <Droplet className="text-purple-600" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Monthly Deliveries</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{stats.monthlyDeliveries}</p>
            </div>
            <Calendar className="text-orange-600" size={40} />
          </div>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card title="Today's Summary">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-green-600">₹{stats.todayRevenue.toFixed(2)}</p>
          </div>
        </div>
        <Link to="/diary" className="block mt-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Add Today's Deliveries
          </button>
        </Link>
      </Card>

      {/* Recent Deliveries */}
      <Card title="Recent Deliveries">
        {recentDeliveries.length > 0 ? (
          <div className="space-y-3">
            {recentDeliveries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{getCustomerName(entry.customerId)}</p>
                  <p className="text-sm text-gray-600">{format(new Date(entry.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{entry.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{entry.quantity} L</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No deliveries yet</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/customers">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors">
              Manage Customers
            </button>
          </Link>
          <Link to="/diary">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors">
              Add Delivery
            </button>
          </Link>
          <Link to="/reports">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors">
              View Reports
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
