export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'investment';
  bank?: string;
}

export interface Card {
  id: string;
  name: string;
  limit: number;
  used: number;
  type: 'credit' | 'debit';
  bank?: string;
  dueDate?: string;
  closingDate?: string;
}

export interface Transaction {
  id: string;
  title: string;
  description?: string;
  userDescription?: string; // Nova propriedade para descrição original do usuário
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  subcategory?: string;
  paymentMethod: 'account' | 'card' | 'cash';
  paymentSource?: string; // account or card id
  status: 'paid' | 'received' | 'pending';
  date: string;
  isRecurring?: boolean;
  isInstallment?: boolean;
  installmentInfo?: {
    current: number;
    total: number;
  };
  transferInfo?: {
    fromAccountId: string;
    toAccountId: string;
  };
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  estimatedMonths?: number;
  isRealistic?: boolean;
  aiSuggestion?: string;
}

export interface Limit {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  limitAmount: number;
  currentAmount: number;
  period: 'monthly' | 'biweekly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';
  alertThreshold: number; // percentage (e.g., 80 for 80%)
  isActive: boolean;
  createdAt: string;
  startDate: string;
  resetDate: string;
  startType: 'today' | 'first_day' | 'last_day';
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'account' | 'card' | 'cash' | 'pix';
export type TransactionStatus = 'paid' | 'received' | 'pending';