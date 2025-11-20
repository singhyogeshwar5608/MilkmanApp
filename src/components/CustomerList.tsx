import React from 'react';
import { Customer } from '../types';
import { Pencil, Trash2, Phone, MapPin } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onViewDetail: (id: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
  onViewDetail,
}) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No customers yet</p>
        <p className="text-sm mt-2">Add your first customer to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <div
          key={customer.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <button
              onClick={() => onViewDetail(customer.id)}
              className="text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 hover:underline">
                {customer.name}
              </h3>
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(customer)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this customer?')) {
                    onDelete(customer.id);
                  }
                }}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Default Quantity:</span>
              <span className="font-medium">{customer.defaultQuantity} L</span>
            </div>
            <div className="flex justify-between">
              <span>Price per Liter:</span>
              <span className="font-medium">₹{customer.pricePerUnit}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Amount:</span>
              <span className="font-medium text-green-600">
                ₹{(customer.defaultQuantity * customer.pricePerUnit).toFixed(2)}
              </span>
            </div>

            {customer.phone && (
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Phone size={14} />
                <span>{customer.phone}</span>
              </div>
            )}

            {customer.address && (
              <div className="flex items-center space-x-2">
                <MapPin size={14} />
                <span className="truncate">{customer.address}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
