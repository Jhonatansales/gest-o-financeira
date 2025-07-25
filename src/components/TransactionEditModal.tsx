import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Tag, CreditCard, Wallet, DollarSign, Edit3 } from 'lucide-react';
import { Transaction, Account, Card, TransactionType, PaymentMethod, TransactionStatus } from '../types/financial';
import { CategorySelector } from './CategorySelector';
import { Category } from '../data/categories';
import { useApp } from '../contexts/AppContext';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  accounts: Account[];
  cards: Card[];
  customCategories?: Category[];
  onAddCustomCategory?: (category: Omit<Category, 'id'>) => void;
  onAddCustomSubcategory?: (categoryId: string, subcategory: Omit<import('../data/categories').SubCategory, 'id'>) => void;
}

export const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdateTransaction,
  accounts,
  cards,
  customCategories = [],
  onAddCustomCategory,
  onAddCustomSubcategory
}) => {
  const { formatCurrency } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    userDescription: '', // Nova campo para descrição do usuário
    amount: '',
    category: '',
    subcategory: '',
    paymentMethod: 'account' as PaymentMethod,
    paymentSource: '',
    status: 'paid' as TransactionStatus,
    date: '',
    isRecurring: false,
    isInstallment: false,
    installmentCurrent: '1',
    installmentTotal: '1'
  });

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        title: transaction.title,
        description: transaction.description || '',
        userDescription: (transaction as any).userDescription || transaction.description || '',
        amount: transaction.amount.toString(),
        category: transaction.category,
        subcategory: transaction.subcategory || '',
        paymentMethod: transaction.paymentMethod,
        paymentSource: transaction.paymentSource || '',
        status: transaction.status,
        date: transaction.date,
        isRecurring: transaction.isRecurring || false,
        isInstallment: transaction.isInstallment || false,
        installmentCurrent: transaction.installmentInfo?.current.toString() || '1',
        installmentTotal: transaction.installmentInfo?.total.toString() || '1'
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const updates: Partial<Transaction> = {
      title: formData.title,
      description: formData.description,
      userDescription: formData.userDescription,
      amount: parseFloat(formData.amount),
      category: formData.category,
      subcategory: formData.subcategory,
      paymentMethod: formData.paymentMethod,
      paymentSource: formData.paymentSource,
      status: formData.status,
      date: formData.date,
      isRecurring: formData.isRecurring,
      isInstallment: formData.isInstallment,
      ...(formData.isInstallment && {
        installmentInfo: {
          current: parseInt(formData.installmentCurrent),
          total: parseInt(formData.installmentTotal)
        }
      })
    };

    onUpdateTransaction(transaction.id, updates);
    onClose();
  };

  const handleCategoryChange = (category: string, subcategory?: string) => {
    setFormData({
      ...formData,
      category,
      subcategory: subcategory || ''
    });
  };

  const getPaymentSourceName = (sourceId: string) => {
    if (formData.paymentMethod === 'account') {
      const account = accounts.find(a => a.id === sourceId);
      return account?.name || 'Conta não encontrada';
    } else if (formData.paymentMethod === 'card') {
      const card = cards.find(c => c.id === sourceId);
      return card?.name || 'Cartão não encontrado';
    }
    return '';
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Editar Transação</h2>
                <p className="text-white text-opacity-90">Modifique os detalhes da transação</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição do Usuário
              </label>
              <textarea
                value={formData.userDescription}
                onChange={(e) => setFormData({ ...formData, userDescription: e.target.value })}
                rows={2}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="O que o usuário especificou originalmente..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta é a descrição original fornecida pelo usuário
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição da Transação
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Descrição detalhada da transação..."
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
            <CategorySelector
              selectedCategory={formData.category}
              selectedSubcategory={formData.subcategory}
              onCategoryChange={handleCategoryChange}
              transactionType={transaction.type}
              customCategories={customCategories}
              onAddCustomCategory={onAddCustomCategory}
              onAddCustomSubcategory={onAddCustomSubcategory}
            />
          </div>

          {/* Método de Pagamento */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Método de Pagamento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      paymentMethod: e.target.value as PaymentMethod,
                      paymentSource: ''
                    });
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  required
                >
                  <option value="pix">PIX</option>
                  <option value="account">Conta Bancária</option>
                  <option value="card">Cartão</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>

              {(formData.paymentMethod === 'account' || formData.paymentMethod === 'card' || formData.paymentMethod === 'pix') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.paymentMethod === 'account' || formData.paymentMethod === 'pix' ? 'Conta' : 'Cartão'} *
                  </label>
                  <select
                    value={formData.paymentSource}
                    onChange={(e) => setFormData({ ...formData, paymentSource: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    required
                  >
                    <option value="">
                      Selecione {formData.paymentMethod === 'account' || formData.paymentMethod === 'pix' ? 'a conta' : 'o cartão'}
                    </option>
                    {(formData.paymentMethod === 'account' || formData.paymentMethod === 'pix' ? accounts : cards).map((source: any) => (
                      <option key={source.id} value={source.id}>
                        {source.name} {formData.paymentMethod === 'account' && `(${formatCurrency(source.balance)})`}
                      </option>
                    ))}
                  </select>
                  {formData.paymentSource && (
                    <p className="text-xs text-gray-600 mt-1">
                      Selecionado: {getPaymentSourceName(formData.paymentSource)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Informações Adicionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TransactionStatus })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                >
                  <option value={transaction.type === 'income' ? 'received' : 'paid'}>
                    {transaction.type === 'income' ? 'Recebido' : 'Pago'}
                  </option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Opções Avançadas */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring-edit"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring-edit" className="ml-2 text-sm font-medium text-gray-700">
                  Lançamento recorrente
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="installment-edit"
                  checked={formData.isInstallment}
                  onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="installment-edit" className="ml-2 text-sm font-medium text-gray-700">
                  Pagamento parcelado
                </label>
              </div>

              {formData.isInstallment && (
                <div className="grid grid-cols-2 gap-4 ml-6 p-4 bg-orange-100 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-orange-700 mb-1">
                      Parcela atual
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.installmentCurrent}
                      onChange={(e) => setFormData({ ...formData, installmentCurrent: e.target.value })}
                      className="w-full text-sm border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-orange-700 mb-1">
                      Total de parcelas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.installmentTotal}
                      onChange={(e) => setFormData({ ...formData, installmentTotal: e.target.value })}
                      className="w-full text-sm border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Save className="h-5 w-5" />
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};