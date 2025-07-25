import { useState, useCallback } from 'react';
import { Account, Card, Transaction, Goal, Limit } from '../types/financial';
import { Category, SubCategory, defaultCategories } from '../data/categories';

// Dados iniciais vazios para contas novas
const initialAccounts: Account[] = [];
const initialCards: Card[] = [];
const initialTransactions: Transaction[] = [];
const initialGoals: Goal[] = [];
const initialLimits: Limit[] = [];

export const useFinancialData = () => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [limits, setLimits] = useState<Limit[]>(initialLimits);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString()
    };
    setAccounts(prev => [...prev, newAccount]);
    
    // Forçar atualização do estado para garantir que o saldo seja refletido
    setTimeout(() => {
      setAccounts(current => [...current]);
    }, 100);
  }, []);

  const updateAccount = useCallback((accountId: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId ? { ...account, ...updates } : account
    ));
  }, []);

  const addCard = useCallback((card: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString()
    };
    setCards(prev => [...prev, newCard]);
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ));
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    // Calcular estimativa de tempo e verificar se é realista
    const monthsToTarget = goal.monthlyContribution > 0 ? 
      Math.ceil((goal.targetAmount - goal.currentAmount) / goal.monthlyContribution) : 0;
    
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsAvailable = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const isRealistic = monthsToTarget <= monthsAvailable;
    let aiSuggestion = '';
    
    if (!isRealistic && goal.monthlyContribution > 0) {
      const requiredMonthly = Math.ceil((goal.targetAmount - goal.currentAmount) / monthsAvailable);
      aiSuggestion = `Para alcançar sua meta até ${targetDate.toLocaleDateString('pt-PT')}, você precisaria poupar ${requiredMonthly.toFixed(2)}€ por mês em vez de ${goal.monthlyContribution.toFixed(2)}€.`;
    }
    
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      estimatedMonths: monthsToTarget,
      isRealistic,
      aiSuggestion
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  }, []);

  const addLimit = useCallback((limit: Omit<Limit, 'id' | 'createdAt' | 'resetDate'>) => {
    const startDate = new Date(limit.startDate);
    const now = new Date();
    let resetDate = new Date(startDate);
    
    switch (limit.period) {
      case 'biweekly':
        resetDate.setDate(resetDate.getDate() + 14);
        break;
      case 'monthly':
        resetDate.setMonth(resetDate.getMonth() + 1);
        break;
      case 'bimonthly':
        resetDate.setMonth(resetDate.getMonth() + 2);
        break;
      case 'quarterly':
        resetDate.setMonth(resetDate.getMonth() + 3);
        break;
      case 'semiannual':
        resetDate.setMonth(resetDate.getMonth() + 6);
        break;
      case 'annual':
        resetDate.setFullYear(resetDate.getFullYear() + 1);
        break;
    }

    const newLimit: Limit = {
      ...limit,
      id: Date.now().toString(),
      createdAt: now.toISOString(),
      startDate: limit.startDate,
      resetDate: resetDate.toISOString()
    };
    setLimits(prev => [...prev, newLimit]);
  }, []);

  const updateLimit = useCallback((limitId: string, updates: Partial<Limit>) => {
    setLimits(prev => prev.map(limit => 
      limit.id === limitId ? { ...limit, ...updates } : limit
    ));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString()
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Update limits when adding expense
    if (transaction.type === 'expense') {
      setLimits(prev => prev.map(limit => {
        if (limit.category === transaction.category && limit.isActive) {
          return { ...limit, currentAmount: limit.currentAmount + transaction.amount };
        }
        return limit;
      }));
    }

    // Update account balances
    if (transaction.type === 'expense' && transaction.status === 'paid' && transaction.paymentMethod === 'account') {
      setAccounts(prev => prev.map(account => 
        account.id === transaction.paymentSource 
          ? { ...account, balance: Math.round((account.balance - transaction.amount) * 100) / 100 }
          : account
      ));
    } else if (transaction.type === 'income' && transaction.status === 'received' && transaction.paymentMethod === 'account') {
      setAccounts(prev => prev.map(account => 
        account.id === transaction.paymentSource 
          ? { ...account, balance: Math.round((account.balance + transaction.amount) * 100) / 100 }
          : account
      ));
    } else if (transaction.type === 'transfer') {
      setAccounts(prev => prev.map(account => {
        if (account.id === transaction.transferInfo?.fromAccountId) {
          return { ...account, balance: Math.round((account.balance - transaction.amount) * 100) / 100 };
        } else if (account.id === transaction.transferInfo?.toAccountId) {
          return { ...account, balance: Math.round((account.balance + transaction.amount) * 100) / 100 };
        }
        return account;
      }));
    }

    // Update card usage
    if (transaction.type === 'expense' && transaction.status === 'paid' && transaction.paymentMethod === 'card') {
      setCards(prev => prev.map(card => 
        card.id === transaction.paymentSource 
          ? { ...card, used: card.used + transaction.amount }
          : card
      ));
    }
  }, []);

  const updateTransaction = useCallback((transactionId: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === transactionId) {
        const oldTransaction = transaction;
        const updatedTransaction = { ...transaction, ...updates };
        
        // Reverter efeitos da transação antiga
        if (oldTransaction.type === 'expense' && oldTransaction.status === 'paid' && oldTransaction.paymentMethod === 'account') {
          setAccounts(prevAccounts => prevAccounts.map(account => 
            account.id === oldTransaction.paymentSource 
              ? { ...account, balance: Math.round((account.balance + oldTransaction.amount) * 100) / 100 }
              : account
          ));
        } else if (oldTransaction.type === 'income' && oldTransaction.status === 'received' && oldTransaction.paymentMethod === 'account') {
          setAccounts(prevAccounts => prevAccounts.map(account => 
            account.id === oldTransaction.paymentSource 
              ? { ...account, balance: Math.round((account.balance - oldTransaction.amount) * 100) / 100 }
              : account
          ));
        } else if (oldTransaction.type === 'expense' && oldTransaction.status === 'paid' && oldTransaction.paymentMethod === 'card') {
          setCards(prevCards => prevCards.map(card => 
            card.id === oldTransaction.paymentSource 
              ? { ...card, used: card.used - oldTransaction.amount }
              : card
          ));
        }
        
        // Aplicar efeitos da transação atualizada
        if (updatedTransaction.type === 'expense' && updatedTransaction.status === 'paid' && updatedTransaction.paymentMethod === 'account') {
          setAccounts(prevAccounts => prevAccounts.map(account => 
            account.id === updatedTransaction.paymentSource 
              ? { ...account, balance: Math.round((account.balance - updatedTransaction.amount) * 100) / 100 }
              : account
          ));
        } else if (updatedTransaction.type === 'income' && updatedTransaction.status === 'received' && updatedTransaction.paymentMethod === 'account') {
          setAccounts(prevAccounts => prevAccounts.map(account => 
            account.id === updatedTransaction.paymentSource 
              ? { ...account, balance: Math.round((account.balance + updatedTransaction.amount) * 100) / 100 }
              : account
          ));
        } else if (updatedTransaction.type === 'expense' && updatedTransaction.status === 'paid' && updatedTransaction.paymentMethod === 'card') {
          setCards(prevCards => prevCards.map(card => 
            card.id === updatedTransaction.paymentSource 
              ? { ...card, used: card.used + updatedTransaction.amount }
              : card
          ));
        }
        
        return updatedTransaction;
      }
      return transaction;
    }));
  }, []);

  const getFinancialSummary = useCallback(() => {
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const monthlyIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalReceived = transactions
      .filter(t => t.type === 'income' && t.status === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPaid = transactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      totalReceived,
      totalPaid
    };
  }, [accounts, transactions]);

  const addCustomCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `custom-${Date.now()}`,
      subcategories: []
    };
    setCustomCategories(prev => [...prev, newCategory]);
  }, []);

  const addCustomSubcategory = useCallback((categoryId: string, subcategory: Omit<SubCategory, 'id'>) => {
    const newSubcategory: SubCategory = {
      ...subcategory,
      id: `sub-${Date.now()}`
    };
    
    // Check if it's a default category
    const defaultCategory = defaultCategories.find(cat => cat.id === categoryId);
    if (defaultCategory) {
      // Create a custom version of the default category with the new subcategory
      const customVersion: Category = {
        ...defaultCategory,
        id: `custom-${categoryId}`,
        subcategories: [...defaultCategory.subcategories, newSubcategory]
      };
      setCustomCategories(prev => {
        const filtered = prev.filter(cat => cat.id !== `custom-${categoryId}`);
        return [...filtered, customVersion];
      });
    } else {
      // It's already a custom category
      setCustomCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
          : cat
      ));
    }
  }, []);

  const resetAllData = useCallback(() => {
    setAccounts([]);
    setCards([]);
    setTransactions([]);
    setCustomCategories([]);
    setGoals([]);
    setLimits([]);
  }, []);

  return {
    accounts,
    cards,
    transactions,
    customCategories,
    goals,
    limits,
    addAccount,
    updateAccount,
    addCard,
    updateCard,
    addTransaction,
    updateTransaction,
    addGoal,
    updateGoal,
    addLimit,
    updateLimit,
    getFinancialSummary,
    addCustomCategory,
    addCustomSubcategory,
    resetAllData
  };
};