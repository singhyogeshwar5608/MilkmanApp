import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Customer, DiaryEntry, Payment, Subscription } from '../types';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const FREE_USER_EMAIL = 'Pardeep@barta.com';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

interface AppContextType {
  customers: Customer[];
  diaryEntries: DiaryEntry[];
  payments: Payment[];
  subscription: Subscription | null;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  updateDiaryEntry: (id: string, entry: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'userId' | 'createdAt'>) => void;
  deletePayment: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getDiaryEntriesByDate: (date: string) => DiaryEntry[];
  getDiaryEntriesByCustomer: (customerId: string) => DiaryEntry[];
  getPaymentsByCustomer: (customerId: string) => Payment[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Real-time listener for customers scoped to current user
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      return;
    }
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];
      setCustomers(customersData);
    }, (error) => {
      console.error('Error fetching customers:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time listener for diary entries scoped to current user
  useEffect(() => {
    if (!user) {
      setDiaryEntries([]);
      return;
    }
    const entriesRef = collection(db, 'diaryEntries');
    const q = query(entriesRef, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DiaryEntry[];
      setDiaryEntries(entriesData);
    }, (error) => {
      console.error('Error fetching diary entries:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time listener for payments scoped to current user
  useEffect(() => {
    if (!user) {
      setPayments([]);
      return;
    }
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
      setPayments(paymentsData);
    }, (error) => {
      console.error('Error fetching payments:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time listener for subscription of current user
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      return;
    }
    const subsRef = collection(db, 'subscriptions');
    const q = query(subsRef, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Subscription[];
        setSubscription(subs[0] ?? null);
      },
      (error) => {
        console.error('Error fetching subscription:', error);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    if (!user) return;

    const newCustomer = {
      ...customer,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };

    addDoc(collection(db, 'customers'), newCustomer).catch((error) => {
      console.error('Error adding customer:', error);
    });
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const { id: _ignored, ...rest } = updates;

    updateDoc(doc(db, 'customers', id), rest as Partial<Customer>).catch((error) => {
      console.error('Error updating customer:', error);
    });
  };

  const deleteCustomer = (id: string) => {
    // Delete customer document
    deleteDoc(doc(db, 'customers', id))
      .then(() => {
        // Also delete associated diary entries
        const entriesRef = collection(db, 'diaryEntries');
        const q1 = query(entriesRef, where('customerId', '==', id));
        return getDocs(q1);
      })
      .then((snapshot) => {
        const deletions = snapshot.docs.map((entryDoc) => deleteDoc(entryDoc.ref));
        return Promise.all(deletions);
      })
      .then(() => {
        // And delete related payments
        const paymentsRef = collection(db, 'payments');
        const q2 = query(paymentsRef, where('customerId', '==', id));
        return getDocs(q2);
      })
      .then((snapshot) => {
        const deletions = snapshot.docs.map((paymentDoc) => deleteDoc(paymentDoc.ref));
        return Promise.all(deletions);
      })
      .catch((error) => {
        console.error('Error deleting customer and related data:', error);
      });
  };

  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id'>) => {
    if (!user) return;

    const userEmail = user.email?.toLowerCase() || '';
    const isFreeUser = userEmail === FREE_USER_EMAIL.toLowerCase();

    // Enforce demo limit: by default allow only 3 diary entries per user
    const effectiveLimit = isFreeUser ? null : subscription?.entryLimit ?? 3;
    if (effectiveLimit !== null && diaryEntries.length >= effectiveLimit) {
      alert('Demo limit reached. Please contact the owner to upgrade your subscription.');
      return;
    }

    const newEntry = {
      ...entry,
      userId: user.uid,
    };

    addDoc(collection(db, 'diaryEntries'), newEntry).catch((error) => {
      console.error('Error adding diary entry:', error);
    });
  };

  const updateDiaryEntry = (id: string, updates: Partial<DiaryEntry>) => {
    const { id: _ignored, ...rest } = updates;

    updateDoc(doc(db, 'diaryEntries', id), rest as Partial<DiaryEntry>).catch((error) => {
      console.error('Error updating diary entry:', error);
    });
  };

  const deleteDiaryEntry = (id: string) => {
    deleteDoc(doc(db, 'diaryEntries', id)).catch((error) => {
      console.error('Error deleting diary entry:', error);
    });
  };

  const addPayment = (payment: Omit<Payment, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const { note, ...rest } = payment;
    const newPayment: any = {
      ...rest,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };

    // Firestore does not allow undefined values; only add note when present
    if (typeof note === 'string' && note.trim() !== '') {
      newPayment.note = note.trim();
    }

    addDoc(collection(db, 'payments'), newPayment).catch((error) => {
      console.error('Error adding payment:', error);
    });
  };

  const deletePayment = (id: string) => {
    deleteDoc(doc(db, 'payments', id)).catch((error) => {
      console.error('Error deleting payment:', error);
    });
  };

  const getCustomerById = (id: string) => {
    return customers.find((customer) => customer.id === id);
  };

  const getDiaryEntriesByDate = (date: string) => {
    return diaryEntries.filter((entry) => entry.date === date);
  };

  const getDiaryEntriesByCustomer = (customerId: string) => {
    return diaryEntries.filter((entry) => entry.customerId === customerId);
  };

  const getPaymentsByCustomer = (customerId: string) => {
    return payments.filter((payment) => payment.customerId === customerId);
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        diaryEntries,
        payments,
        subscription,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addDiaryEntry,
        updateDiaryEntry,
        deleteDiaryEntry,
        addPayment,
        deletePayment,
        getCustomerById,
        getDiaryEntriesByDate,
        getDiaryEntriesByCustomer,
        getPaymentsByCustomer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
