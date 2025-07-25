import React, { useState } from 'react';
import { Plus, Wallet, Trash2, Edit3, Save, X, Building, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Account } from '../types/financial';
import { useApp } from '../contexts/AppContext';

interface AccountsManagerProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount?: (accountId: string, updates: Partial<Account>) => void;
}

// Bancos brasileiros com suas informações visuais
const brazilianBanks = [
  { 
    id: 'nubank', 
    name: 'Nubank', 
    color: 'from-purple-600 to-purple-700',
    textColor: 'text-white',
    logo: '🟣'
  },
  { 
    id: 'itau', 
    name: 'Itaú Unibanco', 
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-white',
    logo: '🟠'
  },
  { 
    id: 'bradesco', 
    name: 'Bradesco', 
    color: 'from-red-500 to-red-600',
    textColor: 'text-white',
    logo: '🔴'
  },
  { 
    id: 'santander', 
    name: 'Santander', 
    color: 'from-red-600 to-red-700',
    textColor: 'text-white',
    logo: '🔴'
  },
  { 
    id: 'bb', 
    name: 'Banco do Brasil', 
    color: 'from-yellow-500 to-yellow-600',
    textColor: 'text-gray-900',
    logo: '🟡'
  },
  { 
    id: 'caixa', 
    name: 'Caixa Econômica Federal', 
    color: 'from-blue-600 to-blue-700',
    textColor: 'text-white',
    logo: '🔵'
  },
  { 
    id: 'inter', 
    name: 'Banco Inter', 
    color: 'from-orange-400 to-orange-500',
    textColor: 'text-white',
    logo: '🟠'
  },
  { 
    id: 'c6', 
    name: 'C6 Bank', 
    color: 'from-gray-700 to-gray-800',
    textColor: 'text-white',
    logo: '⚫'
  },
  { 
    id: 'original', 
    name: 'Banco Original', 
    color: 'from-green-500 to-green-600',
    textColor: 'text-white',
    logo: '🟢'
  },
  { 
    id: 'next', 
    name: 'Next (Bradesco)', 
    color: 'from-green-400 to-green-500',
    textColor: 'text-white',
    logo: '🟢'
  },
  { 
    id: 'picpay', 
    name: 'PicPay', 
    color: 'from-green-400 to-green-500',
    textColor: 'text-white',
    logo: '💚'
  },
  { 
    id: 'neon', 
    name: 'Neon', 
    color: 'from-blue-400 to-blue-500',
    textColor: 'text-white',
    logo: '💙'
  }
];

export const AccountsManager: React.FC<AccountsManagerProps> = ({
  accounts,
  onAddAccount,
  onUpdateAccount
}) => {
  const { formatCurrency } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState<{ [key: string]: boolean }>({});
  const [editForm, setEditForm] = useState({
    name: '',
    balance: '',
    type: 'checking' as Account['type'],
    bank: ''
  });
  const [formData, setFormData] = useState({
    bank: '',
    type: 'checking' as Account['type'],
    balance: '',
    customName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bank && formData.balance) {
      const selectedBank = brazilianBanks.find(bank => bank.id === formData.bank);
      const accountName = formData.customName || 
        `${selectedBank?.name || formData.bank} - ${getAccountTypeText(formData.type)}`;
      
      onAddAccount({
        name: accountName,
        balance: parseFloat(formData.balance),
        type: formData.type,
        bank: formData.bank
      });
      
      setFormData({ bank: '', type: 'checking', balance: '', customName: '' });
      setShowAddForm(false);
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account.id);
    setEditForm({
      name: account.name,
      balance: account.balance.toString(),
      type: account.type,
      bank: account.bank || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingAccount && onUpdateAccount) {
      onUpdateAccount(editingAccount, {
        name: editForm.name,
        balance: parseFloat(editForm.balance),
        type: editForm.type,
        bank: editForm.bank
      });
      setEditingAccount(null);
      setEditForm({ name: '', balance: '', type: 'checking', bank: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setEditForm({ name: '', balance: '', type: 'checking', bank: '' });
  };

  const toggleBalanceVisibility = (accountId: string) => {
    setShowBalance(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getAccountTypeText = (type: Account['type']) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Conta Poupança';
      case 'investment': return 'Conta Investimento';
      default: return 'Conta';
    }
  };

  const getBankInfo = (bankId?: string) => {
    return brazilianBanks.find(bank => bank.id === bankId) || {
      id: 'outros',
      name: 'Outros',
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-white',
      logo: '🏦'
    };
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            Minhas Contas
          </h2>
          <div className="mt-2 flex items-center gap-4">
            <p className="text-gray-600">
              {accounts.length} conta{accounts.length !== 1 ? 's' : ''} registrada{accounts.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-bold text-green-700">
                Saldo Total: {formatCurrency(getTotalBalance())}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          Nova Conta
        </button>
      </div>

      {/* Formulário de Adicionar Conta */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 animate-scaleIn border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Adicionar Nova Conta</h3>
              <p className="text-gray-600 text-lg">Cadastre uma nova conta bancária</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Banco *
                </label>
                <select
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className="w-full border-2 border-blue-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                  required
                >
                  <option value="">Selecione o banco</option>
                  {brazilianBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.logo} {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Tipo de Conta *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'] })}
                  className="w-full border-2 border-blue-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Conta Poupança</option>
                  <option value="investment">Conta Investimento</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Saldo Inicial *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-100 p-2 rounded-lg">
                    <span className="text-blue-600 font-bold">R$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full pl-16 pr-6 py-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 bg-white shadow-lg text-lg font-semibold hover:shadow-xl"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Nome Personalizado (opcional)
                </label>
                <input
                  type="text"
                  value={formData.customName}
                  onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                  className="w-full border-2 border-blue-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                  placeholder="Ex: Conta Salário"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300"
              >
                Adicionar Conta
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const bankInfo = getBankInfo(account.bank);
          const isEditing = editingAccount === account.id;
          const isBalanceVisible = showBalance[account.id];

          return (
            <div 
              key={account.id} 
              className={`bg-gradient-to-br ${bankInfo.color} ${bankInfo.textColor} p-6 rounded-2xl shadow-lg card-hover animate-slideIn relative overflow-hidden`}
            >
              {isEditing ? (
                /* Modo de Edição */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Editar Conta</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-70 text-sm"
                    placeholder="Nome da conta"
                  />
                  
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.balance}
                    onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-70 text-sm"
                    placeholder="Saldo"
                  />
                  
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Account['type'] })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="checking" className="text-gray-900">Conta Corrente</option>
                    <option value="savings" className="text-gray-900">Conta Poupança</option>
                    <option value="investment" className="text-gray-900">Conta Investimento</option>
                  </select>
                </div>
              ) : (
                /* Modo de Visualização */
                <>
                  {/* Logo do banco */}
                  <div className="absolute top-4 right-4 text-2xl opacity-80">
                    {bankInfo.logo}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-6 w-6" />
                      <span className="text-sm opacity-90 font-medium">
                        {getAccountTypeText(account.type)}
                      </span>
                    </div>
                    {onUpdateAccount && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBalanceVisibility(account.id)}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1">{account.name}</h3>
                    <p className="text-sm opacity-90">{bankInfo.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Saldo Atual</span>
                      <button
                        onClick={() => toggleBalanceVisibility(account.id)}
                        className="text-right"
                      >
                        {isBalanceVisible ? (
                          <span className="text-2xl font-bold">{formatCurrency(account.balance)}</span>
                        ) : (
                          <span className="text-2xl font-bold">••••••</span>
                        )}
                      </button>
                    </div>
                    
                    <div className="pt-2 border-t border-white border-opacity-20">
                      <div className="flex items-center justify-between text-xs opacity-80">
                        <span>Tipo: {getAccountTypeText(account.type)}</span>
                        <span>💳 {bankInfo.name}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado vazio */}
      {accounts.length === 0 && !showAddForm && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma conta registrada</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comece adicionando suas contas bancárias para ter controle total das suas finanças
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Adicionar Primeira Conta
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountsManager;