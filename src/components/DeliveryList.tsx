import React from 'react';
import { DiaryEntry, Customer } from '../types';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';

interface DeliveryListProps {
  entries: DiaryEntry[];
  customers: Customer[];
  onDelete: (id: string) => void;
  onToggleDelivered: (id: string, delivered: boolean) => void;
}

export const DeliveryList: React.FC<DeliveryListProps> = ({
  entries,
  customers,
  onDelete,
  onToggleDelivered,
}) => {
  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || 'Unknown';
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No deliveries for this date</p>
        <p className="text-sm mt-2">Add a delivery to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`bg-white border rounded-lg p-4 ${
            entry.delivered ? 'border-green-200' : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getCustomerName(entry.customerId)}
                </h3>
                <button
                  onClick={() => onToggleDelivered(entry.id, !entry.delivered)}
                  className="text-sm"
                  title={entry.delivered ? 'Mark as not delivered' : 'Mark as delivered'}
                >
                  {entry.delivered ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <XCircle size={20} className="text-gray-400" />
                  )}
                </button>
              </div>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex space-x-4">
                  <span>
                    <span className="font-medium">Quantity:</span> {entry.quantity} L
                  </span>
                  <span>
                    <span className="font-medium">Amount:</span> ₹{entry.amount.toFixed(2)}
                  </span>
                </div>
                {entry.notes && (
                  <div className="text-gray-500 italic">
                    <span className="font-medium">Notes:</span> {entry.notes}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this delivery?')) {
                  onDelete(entry.id);
                }
              }}
              className="text-red-600 hover:text-red-800 ml-4"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total for this date:</span>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              ₹{entries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {entries.reduce((sum, entry) => sum + entry.quantity, 0).toFixed(1)} L
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
