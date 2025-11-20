import React, { useState } from 'react';
import { Customer } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    defaultQuantity: customer?.defaultQuantity || 0,
    pricePerUnit: customer?.pricePerUnit || 0,
    phone: customer?.phone || '',
    address: customer?.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'defaultQuantity' || name === 'pricePerUnit' ? parseFloat(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.defaultQuantity <= 0) {
      newErrors.defaultQuantity = 'Quantity must be greater than 0';
    }
    if (formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Customer Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter customer name"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Default Quantity (Liters) *"
          name="defaultQuantity"
          type="number"
          step="0.5"
          min="0"
          value={formData.defaultQuantity}
          onChange={handleChange}
          error={errors.defaultQuantity}
          placeholder="e.g., 2"
        />

        <Input
          label="Price per Liter (₹) *"
          name="pricePerUnit"
          type="number"
          step="0.01"
          min="0"
          value={formData.pricePerUnit}
          onChange={handleChange}
          error={errors.pricePerUnit}
          placeholder="e.g., 60"
        />
      </div>

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Enter phone number"
      />

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Enter address"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {customer ? 'Update' : 'Add'} Customer
        </Button>
      </div>
    </form>
  );
};
