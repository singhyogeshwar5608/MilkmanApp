import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryForm } from '../components/DeliveryForm';
import { DeliveryList } from '../components/DeliveryList';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

export const Diary: React.FC = () => {
  const { customers, diaryEntries, subscription, addDiaryEntry, deleteDiaryEntry, updateDiaryEntry } = useApp();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const entriesForDate = useMemo(() => {
    return diaryEntries.filter((entry) => entry.date === selectedDate);
  }, [diaryEntries, selectedDate]);

  const effectiveLimit = subscription?.entryLimit ?? 3;
  const usedEntries = diaryEntries.length;
  const remainingEntries =
    effectiveLimit === null ? null : Math.max(effectiveLimit - usedEntries, 0);

  const handlePreviousDay = () => {
    setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleAddDelivery = () => {
    if (customers.length === 0) {
      alert('Please add customers first before recording deliveries.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (entry: {
    customerId: string;
    date: string;
    quantity: number;
    amount: number;
    notes?: string;
    delivered: boolean;
  }) => {
    addDiaryEntry(entry);
    setIsModalOpen(false);
  };

  const handleToggleDelivered = (id: string, delivered: boolean) => {
    updateDiaryEntry(id, { delivered });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Daily Diary</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">Record and track daily milk deliveries</p>
        </div>
        <Button onClick={handleAddDelivery} className="w-full sm:w-auto justify-center">
          <Plus size={20} className="mr-2" />
          Add Delivery
        </Button>
      </div>

      {effectiveLimit !== null && (
        <div className="mt-3">
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700 px-4 py-2 text-xs sm:text-sm text-yellow-800 dark:text-yellow-100">
            <span className="font-medium">Demo usage:</span>{' '}
            {usedEntries} of {effectiveLimit} free entries used.{' '}
            {remainingEntries !== null && remainingEntries > 0 && (
              <span>
                You have <span className="font-semibold">{remainingEntries}</span> left.
              </span>
            )}
            {remainingEntries !== null && remainingEntries <= 0 && (
              <span>Your free entries are finished.</span>
            )}
          </div>
        </div>
      )}

      {/* Date Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="secondary" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-2xl font-bold text-gray-900">
            {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Deliveries for Selected Date */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Deliveries</h2>
        <DeliveryList
          entries={entriesForDate}
          customers={customers}
          onDelete={deleteDiaryEntry}
          onToggleDelivered={handleToggleDelivered}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Delivery"
      >
        <DeliveryForm
          customers={customers}
          selectedDate={selectedDate}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
