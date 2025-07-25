import React, { useState, useMemo } from 'react';
import { X, CreditCard, Calendar, Bell, AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { Card, Transaction } from '../types/financial';
import { useApp } from '../contexts/AppContext';
import { defaultCategories } from '../data/categories';

interface CardInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  transactions: Transaction[];
}

export const CardInvoiceModal: React.FC<CardInvoiceModalProps> = ({
  isOpen,
  onClose,
  card,
  transactions
}) => {
  const { formatCurrency } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const cardTransactions = useMemo(() => {
    if (!card) return [];
    
    return transactions.filter(t => 
      t.paymentMethod === 'card' && 
      t.paymentSource === card.id &&
      t.type === 'expense' &&
      t.date.startsWith(selectedMonth)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [card, transactions, selectedMonth]);

  const invoiceTotal = useMemo(() => {
    return cardTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [cardTransactions]);

  const getDueDate = () => {
    if (!card?.dueDate) return null;
    const [year, month] = selectedMonth.split('-');
    const dueDay = parseInt(card.dueDate);
    return new Date(parseInt(year), parseInt(month) - 1, dueDay);
  };

  const getClosingDate = () => {
    if (!card?.closingDate) return null;
    const [year, month] = selectedMonth.split('-');
    const closingDay = parseInt(card.closingDate);
    return new Date(parseInt(year), parseInt(month) - 1, closingDay);
  };

  const getDaysUntilDue = () => {
    const dueDate = getDueDate();
    if (!dueDate) return null;
    
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPaymentStatus = () => {
    const daysUntilDue = getDaysUntilDue();
    if (daysUntilDue === null) return { status: 'unknown', color: 'gray', icon: Clock };
    
    if (daysUntilDue < 0) return { status: 'overdue', color: 'red', icon: AlertTriangle };
    if (daysUntilDue <= 3) return { status: 'urgent', color: 'orange', icon: AlertTriangle };
    if (daysUntilDue <= 7) return { status: 'warning', color: 'yellow', icon: Bell };
    return { status: 'ok', color: 'green', icon: CheckCircle };
  };

  const getCategoryName = (categoryId: string, subcategoryId?: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    if (category && subcategoryId) {
      const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      return subcategory ? subcategory.name : category.name;
    }
    return category?.name || categoryId;
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  };

  if (!isOpen || !card) return null;

  const paymentStatus = getPaymentStatus();
  const dueDate = getDueDate();
  const closingDate = getClosingDate();
  const daysUntilDue = getDaysUntilDue();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Fatura do Cartão</h2>
                <p className="text-white text-opacity-90">{card.name}</p>
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

        <div className="p-8 space-y-8">
          {/* Seletor de Mês e Resumo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seletor de Mês */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Período</h3>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              >
                {getMonthOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Total da Fatura */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Total da Fatura</h3>
              </div>
              <p className="text-3xl font-bold text-green-700">{formatCurrency(invoiceTotal)}</p>
              <p className="text-sm text-green-600 mt-1">
                {cardTransactions.length} transação{cardTransactions.length !== 1 ? 'ões' : ''}
              </p>
            </div>

            {/* Status de Pagamento */}
            <div className={`bg-gradient-to-r from-${paymentStatus.color}-50 to-${paymentStatus.color}-100 p-6 rounded-2xl border border-${paymentStatus.color}-200`}>
              <div className="flex items-center gap-3 mb-4">
                <paymentStatus.icon className={`h-5 w-5 text-${paymentStatus.color}-600`} />
                <h3 className={`text-lg font-semibold text-${paymentStatus.color}-900`}>Status</h3>
              </div>
              {dueDate && (
                <>
                  <p className={`text-sm text-${paymentStatus.color}-700 mb-2`}>
                    Vencimento: {dueDate.toLocaleDateString('pt-PT')}
                  </p>
                  {daysUntilDue !== null && (
                    <p className={`text-lg font-bold text-${paymentStatus.color}-700`}>
                      {daysUntilDue < 0 
                        ? `${Math.abs(daysUntilDue)} dias em atraso`
                        : daysUntilDue === 0 
                        ? 'Vence hoje!'
                        : `${daysUntilDue} dias restantes`
                      }
                    </p>
                  )}
                </>
              )}
              {closingDate && (
                <p className={`text-xs text-${paymentStatus.color}-600 mt-2`}>
                  Fechamento: {closingDate.toLocaleDateString('pt-PT')}
                </p>
              )}
            </div>
          </div>

          {/* Lembrete de Pagamento */}
          {paymentStatus.status === 'urgent' || paymentStatus.status === 'overdue' && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-bold text-red-900">
                  {paymentStatus.status === 'overdue' ? '🚨 Fatura em Atraso!' : '⚠️ Fatura Próxima do Vencimento!'}
                </h3>
              </div>
              <p className="text-red-700 mb-4">
                {paymentStatus.status === 'overdue' 
                  ? `Sua fatura está ${Math.abs(daysUntilDue!)} dias em atraso. Pague o quanto antes para evitar juros e multas.`
                  : `Sua fatura vence em ${daysUntilDue} dias. Não se esqueça de efetuar o pagamento!`
                }
              </p>
              <div className="bg-white bg-opacity-50 rounded-xl p-4">
                <p className="text-red-800 font-semibold">
                  💰 Valor a pagar: {formatCurrency(invoiceTotal)}
                </p>
                {dueDate && (
                  <p className="text-red-700 text-sm mt-1">
                    📅 Data de vencimento: {dueDate.toLocaleDateString('pt-PT')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Lista de Transações */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Transações da Fatura</h3>
              </div>
            </div>

            {cardTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cardTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString('pt-PT')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.title}
                          </div>
                          {transaction.description && (
                            <div className="text-sm text-gray-500">
                              {transaction.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {getCategoryName(transaction.category, transaction.subcategory)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-900">
                        Total da Fatura:
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-lg text-purple-600">
                        {formatCurrency(invoiceTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-gray-600">
                  Não há transações neste cartão para o período selecionado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};