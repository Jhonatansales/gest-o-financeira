import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Tag, CreditCard, TrendingUp, TrendingDown, ArrowRightLeft, CheckCircle, Clock, XCircle, Search, Filter, Download, Edit3, FileText, Receipt } from 'lucide-react';
import { Transaction, Account, Card } from '../types/financial';
import { defaultCategories } from '../data/categories';
import { useApp } from '../contexts/AppContext';
import { TransactionEditModal } from './TransactionEditModal';
import { Category } from '../data/categories';

interface TransactionsHistoryProps {
  transactions: Transaction[];
  accounts: Account[];
  cards: Card[];
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  customCategories?: Category[];
  onAddCustomCategory?: (category: Omit<Category, 'id'>) => void;
  onAddCustomSubcategory?: (categoryId: string, subcategory: Omit<import('../data/categories').SubCategory, 'id'>) => void;
  initialFilter?: 'all' | 'income' | 'expense';
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year';
type FilterType = 'all' | 'income' | 'expense' | 'transfer';

export const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({
  transactions,
  accounts,
  cards,
  onUpdateTransaction,
  customCategories = [],
  onAddCustomCategory,
  onAddCustomSubcategory,
  initialFilter = 'all'
}) => {
  const { formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [filterType, setFilterType] = useState<FilterType>(initialFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  // Aplicar filtro inicial quando o componente é montado
  useEffect(() => {
    setFilterType(initialFilter);
    if (initialFilter !== 'all') {
      setShowFilters(true);
    }
  }, [initialFilter]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-PT'),
      time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPaymentSourceName = (transaction: Transaction) => {
    if (transaction.paymentMethod === 'cash') return 'Dinheiro';
    if (transaction.paymentMethod === 'pix') return 'PIX';
    if (transaction.paymentMethod === 'account' || transaction.paymentMethod === 'pix') {
      const account = accounts.find(a => a.id === transaction.paymentSource);
      return account?.name || 'Conta';
    }
    if (transaction.paymentMethod === 'card') {
      const card = cards.find(c => c.id === transaction.paymentSource);
      return card?.name || 'Cartão';
    }
    return '-';
  };

  const getCategoryDisplay = (transaction: Transaction) => {
    const category = defaultCategories.find(cat => cat.id === transaction.category);
    if (category && transaction.subcategory) {
      const subcategory = category.subcategories.find(sub => sub.id === transaction.subcategory);
      return subcategory ? `${category.name} > ${subcategory.name}` : transaction.category;
    }
    return category?.name || transaction.category;
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'transfer':
        return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'paid':
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'received':
        return 'Recebido';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'transfer':
        return 'Transferência';
      default:
        return type;
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingTransaction(null);
    setShowEditModal(false);
  };

  const toggleTransactionDetails = (transactionId: string) => {
    setExpandedTransaction(expandedTransaction === transactionId ? null : transactionId);
  };
  const isWithinPeriod = (transactionDate: string, period: FilterPeriod): boolean => {
    const now = new Date();
    const transDate = new Date(transactionDate);
    
    switch (period) {
      case 'today':
        return transDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return transDate >= monthAgo;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return transDate >= yearAgo;
      default:
        return true;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filtro de pesquisa
      const matchesSearch = searchTerm === '' || 
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryDisplay(transaction).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPaymentSourceName(transaction).toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de período
      const matchesPeriod = isWithinPeriod(transaction.date, filterPeriod);

      // Filtro de tipo
      const matchesType = filterType === 'all' || transaction.type === filterType;

      return matchesSearch && matchesPeriod && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterPeriod, filterType]);

  const exportToCSV = () => {
    const headers = ['Data', 'Hora', 'Título', 'Valor', 'Tipo', 'Categoria', 'Pagamento', 'Status'];
    const csvData = filteredTransactions.map(transaction => {
      const { date, time } = formatDateTime(transaction.date);
      return [
        date,
        time,
        transaction.title,
        transaction.amount.toFixed(2),
        getTypeText(transaction.type),
        getCategoryDisplay(transaction),
        getPaymentSourceName(transaction),
        getStatusText(transaction.status)
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Histórico de Transações</h2>
          <p className="text-gray-600">
            {filteredTransactions.length} de {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-3 lg:py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-gray-300 touch-target"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 lg:py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 touch-target"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, descrição, categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-4 lg:py-3 text-base lg:text-sm border border-gray-300 rounded-xl lg:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                className="w-full border border-gray-300 rounded-xl lg:rounded-lg px-3 py-4 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="year">Último ano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Transação
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full border border-gray-300 rounded-xl lg:rounded-lg px-3 py-4 lg:py-2 text-base lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
                <option value="transfer">Transferências</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <TransactionEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        transaction={editingTransaction}
        onUpdateTransaction={onUpdateTransaction}
        accounts={accounts}
        cards={cards}
        customCategories={customCategories}
        onAddCustomCategory={onAddCustomCategory}
        onAddCustomSubcategory={onAddCustomSubcategory}
      />

      {/* Transactions Table */}
      {/* Desktop Table View */}
      {filteredTransactions.length > 0 && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const { date, time } = formatDateTime(transaction.date);
                  const isExpanded = expandedTransaction === transaction.id;
                  return (
                    <React.Fragment key={transaction.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.title}
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                                <Tag className="h-3 w-3" />
                                <span>{getCategoryDisplay(transaction)}</span>
                              </div>
                              <button
                                onClick={() => toggleTransactionDetails(transaction.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${
                            transaction.type === 'income' 
                              ? 'text-green-600' 
                              : transaction.type === 'expense'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getTypeText(transaction.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {getPaymentSourceName(transaction)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <div>{date}</div>
                              <div className="text-xs text-gray-500">{time}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(transaction.status)}
                            <span className="text-sm text-gray-600">
                              {getStatusText(transaction.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            title="Editar transação"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Linha expandida com detalhes */}
                      {isExpanded && (
                        <tr className="bg-blue-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Descrição do Usuário */}
                              <div className="bg-white p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Receipt className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-semibold text-blue-900">Descrição Original</h4>
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {(transaction as any).userDescription || transaction.description || 'Nenhuma descrição fornecida pelo usuário'}
                                </p>
                              </div>
                              
                              {/* Descrição da Transação */}
                              <div className="bg-white p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-semibold text-blue-900">Descrição da Transação</h4>
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {transaction.description || 'Nenhuma descrição adicional'}
                                </p>
                              </div>
                              
                              {/* Informações Adicionais */}
                              <div className="bg-white p-4 rounded-xl border border-blue-200 md:col-span-2">
                                <h4 className="font-semibold text-blue-900 mb-3">Informações Adicionais</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">ID:</span>
                                    <p className="font-mono text-xs text-gray-700">{transaction.id}</p>
                                  </div>
                                  {transaction.isRecurring && (
                                    <div>
                                      <span className="text-gray-500">Recorrente:</span>
                                      <p className="text-green-600 font-semibold">Sim</p>
                                    </div>
                                  )}
                                  {transaction.isInstallment && transaction.installmentInfo && (
                                    <div>
                                      <span className="text-gray-500">Parcela:</span>
                                      <p className="text-blue-600 font-semibold">
                                        {transaction.installmentInfo.current}/{transaction.installmentInfo.total}
                                      </p>
                                    </div>
                                  )}
                                  {transaction.transferInfo && (
                                    <div>
                                      <span className="text-gray-500">Transferência:</span>
                                      <p className="text-purple-600 font-semibold">Entre contas</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {filteredTransactions.length > 0 && (
        <div className="lg:hidden space-y-4">
          {filteredTransactions.map((transaction) => {
            const { date, time } = formatDateTime(transaction.date);
            const isExpanded = expandedTransaction === transaction.id;
            return (
              <div key={transaction.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      {getTransactionIcon(transaction.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {transaction.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Tag className="h-3 w-3" />
                          {getCategoryDisplay(transaction)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' 
                          ? 'text-green-600' 
                          : transaction.type === 'expense'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {getStatusIcon(transaction.status)}
                        <span className="text-xs text-gray-500">
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span>{getPaymentSourceName(transaction)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{date} {time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getTypeText(transaction.type)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTransactionDetails(transaction.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 touch-target"
                        title="Ver detalhes"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 touch-target"
                        title="Editar transação"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {transaction.description && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-blue-900 text-sm mb-1">Descrição</h4>
                          <p className="text-blue-800 text-sm">{transaction.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">ID:</span>
                          <p className="font-mono text-gray-700 break-all">{transaction.id}</p>
                        </div>
                        {transaction.isRecurring && (
                          <div>
                            <span className="text-gray-500">Recorrente:</span>
                            <p className="text-green-600 font-semibold">Sim</p>
                          </div>
                        )}
                        {transaction.isInstallment && transaction.installmentInfo && (
                          <div>
                            <span className="text-gray-500">Parcela:</span>
                            <p className="text-blue-600 font-semibold">
                              {transaction.installmentInfo.current}/{transaction.installmentInfo.total}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl lg:rounded-2xl shadow-lg">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterPeriod !== 'all' || filterType !== 'all' 
              ? 'Nenhuma transação encontrada' 
              : 'Nenhuma transação registada'
            }
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterPeriod !== 'all' || filterType !== 'all'
              ? 'Tente ajustar os filtros de pesquisa'
              : 'As suas transações aparecerão aqui'
            }
          </p>
        </div>
      )}
    </div>
  );
};