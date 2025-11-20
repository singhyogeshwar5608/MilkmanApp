import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Phone, MapPin, IndianRupee, Share2 } from 'lucide-react';
import { PaymentMethod } from '../types';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    diaryEntries,
    payments,
    addPayment,
    getCustomerById,
    getDiaryEntriesByCustomer,
    getPaymentsByCustomer,
  } = useApp();

  const location = useLocation();
  const fromReports = (location.state as any)?.fromReports;

  const customer = id ? getCustomerById(id) : undefined;
  const customerEntries = useMemo(
    () => (id ? getDiaryEntriesByCustomer(id) : []),
    [id, getDiaryEntriesByCustomer, diaryEntries],
  );

  const customerPayments = useMemo(
    () => (id ? getPaymentsByCustomer(id) : []),
    [id, getPaymentsByCustomer, payments],
  );

  const totals = useMemo(() => {
    const totalDeliveredLiters = customerEntries.reduce(
      (sum, e) => sum + e.quantity,
      0,
    );
    const totalBilled = customerEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalBilled - totalPaid;
    return { totalDeliveredLiters, totalBilled, totalPaid, balance };
  }, [customerEntries, customerPayments]);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2" size={18} /> Back
        </Button>
        <p className="text-red-600">Customer not found.</p>
      </div>
    );
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      await addPayment({
        customerId: customer.id,
        amount,
        method: paymentMethod,
        note: paymentNote || undefined,
        date: today,
      });
      setPaymentAmount('');
      setPaymentNote('');
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!customer.phone) {
      alert('This customer does not have a phone number saved.');
      return;
    }
    const phoneDigits = customer.phone.replace(/\D/g, '');
    const textLines = [
      `Milk Report for ${customer.name}`,
      `Total Milk Delivered: ${totals.totalDeliveredLiters.toFixed(2)} L`,
      `Total Billed: ₹${totals.totalBilled.toFixed(2)}`,
      `Total Paid: ₹${totals.totalPaid.toFixed(2)}`,
      `Balance Due: ₹${totals.balance.toFixed(2)}`,
    ];
    const text = textLines.join('\n');
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2" size={18} /> {fromReports ? 'Back to Report' : 'Back to Customers'}
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer Info and Summary */}
        <div className="space-y-4 lg:col-span-1">
          <Card title="Customer Details">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{customer.name}</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Default Quantity</span>
                <span className="font-medium">{customer.defaultQuantity} L</span>
              </div>
              <div className="flex justify-between">
                <span>Price per Liter</span>
                <span className="font-medium">₹{customer.pricePerUnit}</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Amount</span>
                <span className="font-semibold text-green-700">
                  ₹{(customer.defaultQuantity * customer.pricePerUnit).toFixed(2)}
                </span>
              </div>
              {customer.phone && (
                <div className="flex items-center space-x-2 pt-2 border-t mt-2">
                  <Phone size={16} />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>

            <Button
              className="mt-4 w-full flex items-center justify-center"
              variant="primary"
              onClick={handleShareWhatsApp}
              disabled={!customer.phone}
            >
              <Share2 size={18} className="mr-2" />
              Share Report on WhatsApp
            </Button>
          </Card>

          <Card title="Account Summary">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Total Milk Delivered</span>
                <span className="font-medium">
                  {totals.totalDeliveredLiters.toFixed(2)} L
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Billed</span>
                <span className="font-medium">₹{totals.totalBilled.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Paid</span>
                <span className="font-medium text-green-700">
                  ₹{totals.totalPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Balance Due</span>
                <span
                  className={`font-bold flex items-center ${
                    totals.balance > 0 ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  <IndianRupee size={16} className="mr-1" />
                  {totals.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Recent Deliveries">
            {customerEntries.length === 0 ? (
              <p className="text-sm text-gray-500">No deliveries recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-right py-2 px-2">Qty (L)</th>
                      <th className="text-right py-2 px-2">Amount (₹)</th>
                      <th className="text-left py-2 px-2">Milk quality / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerEntries
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 20)
                      .map((entry) => {
                        const pricePerLitre =
                          entry.quantity > 0 ? entry.amount / entry.quantity : 0;
                        return (
                          <tr key={entry.id} className="border-b border-gray-100">
                            <td className="py-2 px-2">
                              {format(new Date(entry.date), 'dd MMM yyyy')}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {entry.quantity.toFixed(2)} L
                              <span className="block text-[11px] text-gray-500">
                                ₹{pricePerLitre.toFixed(2)} / L
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right font-semibold">
                              ₹{entry.amount.toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-gray-600 max-w-[220px] truncate">
                              {entry.milkQuality
                                ? entry.milkQuality === 'cow'
                                  ? 'Cow milk'
                                  : entry.milkQuality === 'buffalo'
                                  ? 'Buffalo milk'
                                  : entry.milkQuality === 'mixed'
                                  ? 'Mixed milk'
                                  : 'Other'
                                : entry.notes || '-'}
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

        {/* Right: Payments and History */}
        <div className="space-y-4 lg:col-span-2">
          <Card title="Record Payment">
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Input
                  label="Amount (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : 'Add Payment'}
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g., Paid for first week of November"
                />
              </div>
            </form>
          </Card>

          <Card title="Payment History">
            {customerPayments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-right py-2 px-2">Amount (₹)</th>
                      <th className="text-left py-2 px-2">Method</th>
                      <th className="text-left py-2 px-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPayments
                      .slice()
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((p) => (
                        <tr key={p.id} className="border-b border-gray-100">
                          <td className="py-2 px-2">{p.date}</td>
                          <td className="py-2 px-2 text-right font-medium">
                            ₹{p.amount.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 capitalize">{p.method}</td>
                          <td className="py-2 px-2 text-gray-600">
                            {p.note || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
