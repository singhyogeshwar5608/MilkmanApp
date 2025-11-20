import React, { useState } from 'react';
import { Customer, MilkQuality } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface DeliveryFormProps {
  customers: Customer[];
  selectedDate: string;
  onSubmit: (entry: {
    customerId: string;
    date: string;
    quantity: number;
    amount: number;
    notes?: string;
    milkQuality?: MilkQuality;
    delivered: boolean;
  }) => void;
  onCancel: () => void;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  customers,
  selectedDate,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    quantity: 0,
    notes: '',
    delivered: true,
    milkQuality: '' as '' | MilkQuality,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const customer = customers.find((c) => c.id === customerId);
    setFormData((prev) => ({
      ...prev,
      customerId,
      quantity: customer?.defaultQuantity || 0,
    }));
    if (errors.customerId) {
      setErrors((prev) => ({ ...prev, customerId: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Please select a customer';
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && selectedCustomer) {
      const amount = formData.quantity * selectedCustomer.pricePerUnit;
      onSubmit({
        customerId: formData.customerId,
        date: selectedDate,
        quantity: formData.quantity,
        amount,
        notes: formData.notes,
        milkQuality: formData.milkQuality || undefined,
        delivered: formData.delivered,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customer *
        </label>
        <select
          value={formData.customerId}
          onChange={handleCustomerChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.customerId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} (Default: {customer.defaultQuantity}L @ ₹{customer.pricePerUnit}/L)
            </option>
          ))}
        </select>
        {errors.customerId && (
          <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
        )}
      </div>

      <Input
        label="Quantity (Liters) *"
        name="quantity"
        type="number"
        step="0.5"
        min="0"
        value={formData.quantity}
        onChange={handleChange}
        error={errors.quantity}
        placeholder="Enter quantity"
      />

      {selectedCustomer && formData.quantity > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Amount: </span>
            ₹{(formData.quantity * selectedCustomer.pricePerUnit).toFixed(2)}
          </p>
          {formData.milkQuality && (
            <p className="text-xs text-gray-600">
              Milk quality: <span className="font-medium uppercase">{formData.milkQuality}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Milk quality
          </label>
          <select
            name="milkQuality"
            value={formData.milkQuality}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select (optional)</option>
            <option value="cow">Cow milk</option>
            <option value="buffalo">Buffalo milk</option>
            <option value="mixed">Mixed</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes (optional)"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="delivered"
          checked={formData.delivered}
          onChange={(e) => setFormData((prev) => ({ ...prev, delivered: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="delivered" className="ml-2 block text-sm text-gray-700">
          Mark as delivered
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Add Delivery
        </Button>
      </div>
    </form>
  );
};
