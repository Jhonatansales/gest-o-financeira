import React, { useState } from 'react';
import { X, DollarSign, ArrowRightLeft, TrendingUp, TrendingDown, Sparkles, CreditCard, Wallet, Calendar, Tag } from 'lucide-react';
import { Transaction, Account, Card, TransactionType, PaymentMethod, TransactionStatus } from '../types/financial';
import { CategorySelector } from './CategorySelector';
import { Category } from '../data/categories';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  accounts: Account[];
  cards: Card[];
  customCategories?: Category[];
  onAddCustomCategory?: (category: Omit<Category, 'id'>) => void;
  onAddCustomSubcategory?: (categoryId: string, subcategory: Omit<import('../data/categories').SubCategory, 'id'>) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  accounts,
  cards,
  customCategories = [],
  onAddCustomCategory,
  onAddCustomSubcategory
}) => {
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    paymentMethod: 'account' as PaymentMethod,
    paymentSource: '',
    status: 'paid' as TransactionStatus,
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    isInstallment: false,
    installmentCurrent: '1',
    installmentTotal: '1',
    transferFromAccount: '',
    transferToAccount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let transaction: Omit<Transaction, 'id'>;
    
    if (transactionType === 'transfer') {
      transaction = {
        title: formData.title || 'Transferência entre contas',
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: transactionType,
        category: 'Transferência',
        paymentMethod: 'account',
        status: 'paid',
        date: formData.date,
        transferInfo: {
          fromAccountId: formData.transferFromAccount,
          toAccountId: formData.transferToAccount
        }
      };
    } else {
      transaction = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: transactionType,
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
    }

    onAddTransaction(transaction);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: '',
      subcategory: '',
      paymentMethod: 'account',
      paymentSource: '',
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      isInstallment: false,
      installmentCurrent: '1',
      installmentTotal: '1',
      transferFromAccount: '',
      transferToAccount: ''
    });
    setTransactionType('expense');
    onClose();
  };

  const handleCategoryChange = (category: string, subcategory?: string) => {
    setFormData({
      ...formData,
      category,
      subcategory: subcategory || ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 p-0 lg:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl w-full max-w-3xl h-[95vh] lg:max-h-[90vh] overflow-y-auto transform animate-slideIn lg:animate-scaleIn">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 lg:p-6 rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white">Novo Lançamento</h2>
                <p className="text-white text-opacity-90 text-sm lg:text-base">Adicione uma nova transação</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200 transform hover:scale-110 touch-target"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Seleção de Tipo com animações */}
        <div className="p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-white rounded-2xl p-2 shadow-inner">
            <button
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`flex-1 flex items-center justify-center space-x-2 lg:space-x-3 py-3 lg:py-4 px-4 lg:px-6 rounded-xl transition-all duration-300 transform touch-target ${
                transactionType === 'expense'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-red-50 hover:text-red-600 hover:scale-102'
              }`}
            >
              <div className={`p-2 rounded-full ${transactionType === 'expense' ? 'bg-white bg-opacity-20' : 'bg-red-100'}`}>
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm lg:text-base">Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('income')}
              className={`flex-1 flex items-center justify-center space-x-2 lg:space-x-3 py-3 lg:py-4 px-4 lg:px-6 rounded-xl transition-all duration-300 transform touch-target ${
                transactionType === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-600 hover:scale-102'
              }`}
            >
              <div className={`p-2 rounded-full ${transactionType === 'income' ? 'bg-white bg-opacity-20' : 'bg-green-100'}`}>
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm lg:text-base">Receita</span>
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('transfer')}
              className={`flex-1 flex items-center justify-center space-x-2 lg:space-x-3 py-3 lg:py-4 px-4 lg:px-6 rounded-xl transition-all duration-300 transform touch-target ${
                transactionType === 'transfer'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-102'
              }`}
            >
              <div className={`p-2 rounded-full ${transactionType === 'transfer' ? 'bg-white bg-opacity-20' : 'bg-blue-100'}`}>
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm lg:text-base">Transferência</span>
            </button>
          </div>
        </div>

        {/* Formulário com design melhorado */}
        <form onSubmit={handleSubmit} className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {transactionType === 'transfer' ? (
            /* Transfer Form */
            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base lg:text-lg font-semibold text-blue-900">Detalhes da Transferência</h3>
                </div>
                
                <div className="space-y-4 lg:space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      placeholder="Ex: Transferência para poupança"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-100 p-2 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-base lg:text-lg font-semibold"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Conta de Origem *
                      </label>
                      <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          value={formData.transferFromAccount}
                          onChange={(e) => setFormData({ ...formData, transferFromAccount: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 lg:py-3 text-base lg:text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
                          required
                        >
                          <option value="">Selecione a conta</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Conta de Destino *
                      </label>
                      <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          value={formData.transferToAccount}
                          onChange={(e) => setFormData({ ...formData, transferToAccount: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 lg:py-3 text-base lg:text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
                          required
                        >
                          <option value="">Selecione a conta</option>
                          {accounts.filter(account => account.id !== formData.transferFromAccount).map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Income/Expense Form */
            <div className="space-y-4 lg:space-y-6">
              <div className={`p-6 rounded-2xl border-2 ${
                transactionType === 'income' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {transactionType === 'income' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <h3 className={`text-base lg:text-lg font-semibold ${
                    transactionType === 'income' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Detalhes da {transactionType === 'income' ? 'Receita' : 'Despesa'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      placeholder={transactionType === 'income' ? 'Ex: Salário' : 'Ex: Supermercado'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor *
                    </label>
                    <div className="relative">
                      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg ${
                        transactionType === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`h-5 w-5 ${
                          transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-base lg:text-lg font-semibold"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <CategorySelector
                    selectedCategory={formData.category}
                    selectedSubcategory={formData.subcategory}
                    onCategoryChange={handleCategoryChange}
                    transactionType={transactionType}
                    customCategories={customCategories}
                    onAddCustomCategory={onAddCustomCategory}
                    onAddCustomSubcategory={onAddCustomSubcategory}
                  />
                </div>
              </div>

              {/* Método de Pagamento */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 lg:p-6 rounded-2xl border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <h3 className="text-base lg:text-lg font-semibold text-purple-900">Método de Pagamento</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm appearance-none"
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
                        {formData.paymentMethod === 'account' || formData.paymentMethod === 'pix' ? 'Banco/Conta' : 'Cartão'} *
                      </label>
                      <select
                        value={formData.paymentSource}
                        onChange={(e) => setFormData({ ...formData, paymentSource: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm appearance-none"
                        required
                      >
                        <option value="">
                          Selecione {formData.paymentMethod === 'account' || formData.paymentMethod === 'pix' ? 'a conta' : 'o cartão'}
                        </option>
                        {(formData.paymentMethod === 'account' || formData.paymentMethod === 'pix' ? accounts : cards).map((source: any) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 lg:p-6 rounded-2xl border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Informações Adicionais</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TransactionStatus })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
                  required
                >
                  <option value={transactionType === 'income' ? 'received' : 'paid'}>
                    {transactionType === 'income' ? 'Recebido' : 'Pago'}
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
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm resize-none"
                placeholder="Adicione uma descrição..."
              />
            </div>

            {/* Opções Avançadas */}
            {transactionType !== 'transfer' && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded transition-all duration-200 touch-target"
                  />
                  <label htmlFor="recurring" className="ml-3 text-sm lg:text-sm font-medium text-gray-700">
                    Lançamento recorrente
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="installment"
                    checked={formData.isInstallment}
                    onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked })}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded transition-all duration-200 touch-target"
                  />
                  <label htmlFor="installment" className="ml-3 text-sm lg:text-sm font-medium text-gray-700">
                    Pagamento parcelado
                  </label>
                </div>

                {formData.isInstallment && (
                  <div className="grid grid-cols-2 gap-4 ml-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div>
                      <label className="block text-xs font-semibold text-blue-700 mb-1">
                        Parcela atual
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.installmentCurrent}
                        onChange={(e) => setFormData({ ...formData, installmentCurrent: e.target.value })}
                        className="w-full text-base lg:text-sm border-2 border-blue-200 rounded-lg px-3 py-3 lg:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-700 mb-1">
                        Total de parcelas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.installmentTotal}
                        onChange={(e) => setFormData({ ...formData, installmentTotal: e.target.value })}
                        className="w-full text-base lg:text-sm border-2 border-blue-200 rounded-lg px-3 py-3 lg:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 sticky bottom-0 bg-white pb-4 lg:pb-0 lg:static">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-2xl font-bold text-base lg:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 touch-target"
            >
              <Sparkles className="h-5 w-5" />
              Adicionar {transactionType === 'transfer' ? 'Transferência' : transactionType === 'income' ? 'Receita' : 'Despesa'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="sm:flex-shrink-0 px-6 lg:px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 touch-target"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};