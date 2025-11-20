import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Download, ChevronLeft, ChevronRight, Share2, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MonthlySummary, CustomerMonthlyData } from '../types';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { customers, diaryEntries, payments, updateDiaryEntry } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'name' | 'balance'>('amount');
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState('');

  const monthlySummary: MonthlySummary = useMemo(() => {
    const monthEntries = diaryEntries.filter((entry) => entry.date.startsWith(selectedMonth));
    const monthPayments = payments.filter((p) => p.date.startsWith(selectedMonth));

    const totalQuantity = monthEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalRevenue = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const deliveryCount = monthEntries.length;

    // Calculate per-customer breakdown
    const customerMap = new Map<string, CustomerMonthlyData>();

    monthEntries.forEach((entry) => {
      const existing = customerMap.get(entry.customerId);
      if (existing) {
        existing.totalQuantity += entry.quantity;
        existing.totalAmount += entry.amount;
        existing.deliveryCount += 1;
      } else {
        const customer = customers.find((c) => c.id === entry.customerId);
        customerMap.set(entry.customerId, {
          customerId: entry.customerId,
          customerName: customer?.name || 'Unknown',
          totalQuantity: entry.quantity,
          totalAmount: entry.amount,
          deliveryCount: 1,
        });
      }
    });

    // Add payments and balance per customer
    monthPayments.forEach((payment) => {
      const bucket = customerMap.get(payment.customerId);
      if (!bucket) {
        const customer = customers.find((c) => c.id === payment.customerId);
        customerMap.set(payment.customerId, {
          customerId: payment.customerId,
          customerName: customer?.name || 'Unknown',
          totalQuantity: 0,
          totalAmount: 0,
          deliveryCount: 0,
        });
      }
    });

    const customerBreakdown = Array.from(customerMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    return {
      month: selectedMonth,
      totalQuantity,
      totalRevenue,
      deliveryCount,
      customerBreakdown,
    };
  }, [diaryEntries, payments, customers, selectedMonth]);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredCustomerBreakdown = useMemo(() => {
    let rows = monthlySummary.customerBreakdown;

    if (normalizedSearch) {
      rows = rows.filter((row) => {
        const customer = customers.find((c) => c.id === row.customerId);
        const haystack = [
          row.customerName,
          customer?.phone || '',
          customer?.address || '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    const enriched = rows.map((row) => {
      const custPayments = payments.filter(
        (p) =>
          p.customerId === row.customerId &&
          p.date.startsWith(selectedMonth),
      );
      const totalPaid = custPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = row.totalAmount - totalPaid;
      return { row, balance };
    });

    enriched.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.row.customerName.localeCompare(b.row.customerName);
        case 'balance':
          return b.balance - a.balance;
        case 'amount':
        default:
          return b.row.totalAmount - a.row.totalAmount;
      }
    });

    return enriched.map((e) => e.row);
  }, [monthlySummary.customerBreakdown, customers, payments, selectedMonth, normalizedSearch, sortBy]);

  const selectedCustomerForDetail = useMemo(() => {
    if (!detailCustomerId) return null;
    return customers.find((c) => c.id === detailCustomerId) || null;
  }, [detailCustomerId, customers]);

  const detailEntries = useMemo(() => {
    if (!detailCustomerId) return [];
    return diaryEntries
      .filter(
        (entry) =>
          entry.customerId === detailCustomerId &&
          entry.date.startsWith(selectedMonth),
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [detailCustomerId, diaryEntries, selectedMonth]);

  const detailPayments = useMemo(() => {
    if (!detailCustomerId) return [];
    return payments
      .filter(
        (p) =>
          p.customerId === detailCustomerId &&
          p.date.startsWith(selectedMonth),
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [detailCustomerId, payments, selectedMonth]);

  const handlePreviousMonth = () => {
    const date = parseISO(selectedMonth + '-01');
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    setSelectedMonth(format(prevMonth, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const date = parseISO(selectedMonth + '-01');
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    setSelectedMonth(format(nextMonth, 'yyyy-MM'));
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(format(new Date(), 'yyyy-MM'));
  };

  const exportToCSV = () => {
    const headers = ['Customer', 'Deliveries', 'Quantity (L)', 'Billed (₹)', 'Paid (₹)', 'Balance (₹)'];

    const rows = monthlySummary.customerBreakdown.map((customer) => {
      const custPayments = payments.filter(
        (p) =>
          p.customerId === customer.customerId &&
          p.date.startsWith(selectedMonth),
      );
      const totalPaid = custPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = customer.totalAmount - totalPaid;
      return [
        customer.customerName,
        customer.deliveryCount,
        customer.totalQuantity.toFixed(2),
        customer.totalAmount.toFixed(2),
        totalPaid.toFixed(2),
        balance.toFixed(2),
      ];
    });

    const csvContent = [
      [`Monthly Report - ${format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}`],
      [],
      headers,
      ...rows,
      [],
      ['Total', monthlySummary.deliveryCount, monthlySummary.totalQuantity.toFixed(2), monthlySummary.totalRevenue.toFixed(2), '', ''],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `milkman-report-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const openDetail = (customerId: string) => {
    setDetailCustomerId(customerId);
  };

  const closeDetail = () => {
    setDetailCustomerId(null);
    setEditingEntryId(null);
    setEditingPrice('');
  };

  const startEditEntryPrice = (entryId: string) => {
    const entry = detailEntries.find((e) => e.id === entryId);
    if (!entry || entry.quantity <= 0) return;
    const currentPrice = entry.amount / entry.quantity;
    setEditingEntryId(entryId);
    setEditingPrice(currentPrice.toFixed(2));
  };

  const saveEntryPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntryId) return;
    const entry = detailEntries.find((en) => en.id === editingEntryId);
    if (!entry || entry.quantity <= 0) return;

    const newPrice = parseFloat(editingPrice);
    if (!newPrice || newPrice <= 0) {
      alert('Enter a valid price per litre');
      return;
    }

    const newAmount = parseFloat((entry.quantity * newPrice).toFixed(2));
    updateDiaryEntry(entry.id, { amount: newAmount });
    setEditingEntryId(null);
    setEditingPrice('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="text-gray-600 mt-1">View detailed monthly summaries and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={printReport}>
            Print
          </Button>
          <Button onClick={exportToCSV}>
            <Download size={20} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center space-x-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="secondary" size="sm" onClick={handleCurrentMonth}>
              Current Month
            </Button>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-2xl font-bold text-gray-900">
            {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">Total Revenue</p>
            <p className="text-4xl font-bold text-green-900 mt-2">
              ₹{monthlySummary.totalRevenue.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Total Quantity</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">
              {monthlySummary.totalQuantity.toFixed(1)} L
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="text-center">
            <p className="text-sm text-purple-600 font-medium">Total Deliveries</p>
            <p className="text-4xl font-bold text-purple-900 mt-2">
              {monthlySummary.deliveryCount}
            </p>
          </div>
        </Card>
      </div>

      {/* Customer Breakdown (horizontal report layout) */}
      <Card title="Customer Breakdown">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-xs sm:text-sm text-gray-600">
              Filter by customer name, phone, city or village (from address).
            </p>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name / phone / address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'amount' | 'name' | 'balance')}
              className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="amount">Billed (high to low)</option>
              <option value="balance">Balance (high to low)</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
        {filteredCustomerBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Deliveries</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity (L)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Billed (₹)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Paid (₹)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance (₹)</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Share</th>
                </tr>
              </thead>
              <tbody>
        {filteredCustomerBreakdown.map((customer) => {
                  const cust = customers.find((c) => c.id === customer.customerId);
                  const custPayments = payments.filter(
                    (p) =>
                      p.customerId === customer.customerId &&
                      p.date.startsWith(selectedMonth),
                  );
                  const totalPaid = custPayments.reduce(
                    (sum, p) => sum + p.amount,
                    0,
                  );
                  const balance = customer.totalAmount - totalPaid;

                  const handleShareCustomer = () => {
                    if (!cust?.phone) {
                      alert('This customer does not have a phone number saved.');
                      return;
                    }
                    const phoneDigits = cust.phone.replace(/\D/g, '');
                    const textLines = [
                      `Milk Report for ${cust.name} (${format(
                        parseISO(selectedMonth + '-01'),
                        'MMMM yyyy',
                      )})`,
                      `Total Milk: ${customer.totalQuantity.toFixed(2)} L`,
                      `Total Billed: ₹${customer.totalAmount.toFixed(2)}`,
                      `Total Paid: ₹${totalPaid.toFixed(2)}`,
                      `Balance: ₹${balance.toFixed(2)}`,
                    ];
                    const text = textLines.join('\n');
                    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                      text,
                    )}`;
                    window.open(url, '_blank');
                  };

                  const handleRowClick = () => {
                    openDetail(customer.customerId);
                  };

                  return (
                    <tr
                      key={customer.customerId}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={handleRowClick}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {customer.customerName}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {customer.deliveryCount}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {customer.totalQuantity.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₹{customer.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ₹{totalPaid.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ₹{balance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleShareCustomer();
                          }}
                          className="inline-flex items-center px-3 py-1 text-xs rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                          disabled={!cust?.phone}
                        >
                          <Share2 size={14} className="mr-1" />
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">
                    {monthlySummary.deliveryCount}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {monthlySummary.totalQuantity.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    ₹{monthlySummary.totalRevenue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">-</td>
                  <td className="py-3 px-4 text-right">-</td>
                  <td className="py-3 px-4" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {searchText ? 'No customers match this search for the selected month' : 'No data for this month'}
          </p>
        )}
      </Card>

      {/* Customer monthly detail modal */}
      <Modal
        isOpen={!!detailCustomerId}
        onClose={closeDetail}
        title={
          selectedCustomerForDetail
            ? `${selectedCustomerForDetail.name} - ${format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}`
            : 'Customer Details'
        }
      >
        {selectedCustomerForDetail ? (
          <div className="space-y-6 text-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-500">
                <p>Customer ID: {selectedCustomerForDetail.id}</p>
                {selectedCustomerForDetail.phone && (
                  <p>Phone: {selectedCustomerForDetail.phone}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  navigate(`/customers/${selectedCustomerForDetail.id}` , {
                    state: { fromReports: true, month: selectedMonth },
                  });
                  closeDetail();
                }}
              >
                View full profile
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Deliveries</p>
                <p className="text-lg font-semibold text-gray-900">{detailEntries.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Milk</p>
                <p className="text-lg font-semibold text-gray-900">
                  {detailEntries.reduce((sum, e) => sum + e.quantity, 0).toFixed(2)} L
                </p>
              </div>
            </div>

            {/* Deliveries list */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Deliveries</h3>
              {detailEntries.length === 0 ? (
                <p className="text-gray-500">No deliveries for this month.</p>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs md:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-right py-2 px-2">Qty (L)</th>
                        <th className="text-right py-2 px-2">Price/L (₹)</th>
                        <th className="text-right py-2 px-2">Amount (₹)</th>
                        <th className="text-left py-2 px-2">Milk quality / Notes</th>
                        <th className="text-center py-2 px-2">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailEntries.map((entry) => {
                        const pricePerLitre = entry.quantity > 0 ? entry.amount / entry.quantity : 0;
                        return (
                          <tr key={entry.id} className="border-t border-gray-100">
                            <td className="py-2 px-2">
                              {format(new Date(entry.date), 'dd MMM')}
                            </td>
                            <td className="py-2 px-2 text-right">{entry.quantity.toFixed(2)}</td>
                            <td className="py-2 px-2 text-right">₹{pricePerLitre.toFixed(2)}</td>
                            <td className="py-2 px-2 text-right font-semibold">₹{entry.amount.toFixed(2)}</td>
                            <td className="py-2 px-2 text-gray-600 max-w-[160px] truncate">
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
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => startEditEntryPrice(entry.id)}
                                className="inline-flex items-center px-2 py-1 text-[11px] rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700"
                              >
                                <Edit3 size={12} className="mr-1" />
                                Price
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payments list */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Payments</h3>
              {detailPayments.length === 0 ? (
                <p className="text-gray-500">No payments recorded for this month.</p>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs md:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-right py-2 px-2">Amount (₹)</th>
                        <th className="text-left py-2 px-2">Method</th>
                        <th className="text-left py-2 px-2">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailPayments.map((p) => (
                        <tr key={p.id} className="border-t border-gray-100">
                          <td className="py-2 px-2">{p.date}</td>
                          <td className="py-2 px-2 text-right font-semibold">₹{p.amount.toFixed(2)}</td>
                          <td className="py-2 px-2 capitalize">{p.method}</td>
                          <td className="py-2 px-2 text-gray-600 max-w-[200px] truncate">
                            {p.note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Edit price modal (inline) */}
            {editingEntryId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-5">
                  <h3 className="text-base font-semibold mb-3">Update price per litre</h3>
                  <form onSubmit={saveEntryPrice} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price per litre (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingPrice}
                        onChange={(ev) => setEditingPrice(ev.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setEditingEntryId(null);
                          setEditingPrice('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {searchText ? 'No customers match this search for the selected month' : 'No data for this month'}
          </p>
        )}
      </Modal>
    </div>
  );
};
