import React, { useState } from 'react';
import { Plus, CreditCard, Trash2, Edit3, Save, X, Building, TrendingUp, Eye, EyeOff, Receipt, Calendar, AlertTriangle } from 'lucide-react';
import { Card } from '../types/financial';
import { useApp } from '../contexts/AppContext';

interface CardsManagerProps {
  cards: Card[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onUpdateCard?: (cardId: string, updates: Partial<Card>) => void;
  onViewInvoice?: (card: Card) => void;
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

export const CardsManager: React.FC<CardsManagerProps> = ({
  cards,
  onAddCard,
  onUpdateCard,
  onViewInvoice
}) => {
  const { formatCurrency } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState<{ [key: string]: boolean }>({});
  const [editForm, setEditForm] = useState({
    name: '',
    limit: '',
    used: '',
    type: 'credit' as Card['type'],
    bank: '',
    dueDate: '',
    closingDate: ''
  });
  const [formData, setFormData] = useState({
    bank: '',
    type: 'credit' as Card['type'],
    limit: '',
    used: '',
    customName: '',
    dueDate: '',
    closingDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bank && formData.limit) {
      const selectedBank = brazilianBanks.find(bank => bank.id === formData.bank);
      const cardName = formData.customName || 
        `${selectedBank?.name || formData.bank} - ${getCardTypeText(formData.type)}`;
      
      onAddCard({
        name: cardName,
        limit: parseFloat(formData.limit),
        used: parseFloat(formData.used || '0'),
        type: formData.type,
        bank: formData.bank,
        dueDate: formData.dueDate || undefined,
        closingDate: formData.closingDate || undefined
      });
      
      setFormData({ 
        bank: '', 
        type: 'credit', 
        limit: '', 
        used: '', 
        customName: '',
        dueDate: '',
        closingDate: ''
      });
      setShowAddForm(false);
    }
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card.id);
    setEditForm({
      name: card.name,
      limit: card.limit.toString(),
      used: card.used.toString(),
      type: card.type,
      bank: card.bank || '',
      dueDate: card.dueDate || '',
      closingDate: card.closingDate || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingCard && onUpdateCard) {
      onUpdateCard(editingCard, {
        name: editForm.name,
        limit: parseFloat(editForm.limit),
        used: parseFloat(editForm.used),
        type: editForm.type,
        bank: editForm.bank,
        dueDate: editForm.dueDate || undefined,
        closingDate: editForm.closingDate || undefined
      });
      setEditingCard(null);
      setEditForm({ 
        name: '', 
        limit: '', 
        used: '', 
        type: 'credit', 
        bank: '',
        dueDate: '',
        closingDate: ''
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditForm({ 
      name: '', 
      limit: '', 
      used: '', 
      type: 'credit', 
      bank: '',
      dueDate: '',
      closingDate: ''
    });
  };

  const toggleBalanceVisibility = (cardId: string) => {
    setShowBalance(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getCardTypeText = (type: Card['type']) => {
    switch (type) {
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      default: return 'Cartão';
    }
  };

  const getBankInfo = (bankId?: string) => {
    return brazilianBanks.find(bank => bank.id === bankId) || {
      id: 'outros',
      name: 'Outros',
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-white',
      logo: '💳'
    };
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return limit > 0 ? (used / limit) * 100 : 0;
  };

  const getAvailableCredit = (card: Card) => {
    return card.limit - card.used;
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const dueDay = parseInt(dueDate);
    
    let dueDateTime = new Date(currentYear, currentMonth, dueDay);
    
    // Se a data já passou neste mês, considerar o próximo mês
    if (dueDateTime < today) {
      dueDateTime = new Date(currentYear, currentMonth + 1, dueDay);
    }
    
    const diffTime = dueDateTime.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            Meus Cartões
          </h2>
          <div className="mt-2 flex items-center gap-4">
            <p className="text-gray-600">
              {cards.length} cartão{cards.length !== 1 ? 'ões' : ''} registrado{cards.length !== 1 ? 's' : ''}
            </p>
            {cards.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-xl border border-purple-200">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="font-bold text-purple-700">
                  Limite Total: {formatCurrency(cards.reduce((sum, card) => sum + card.limit, 0))}
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          Novo Cartão
        </button>
      </div>

      {/* Formulário de Adicionar Cartão */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-8 animate-scaleIn border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Adicionar Novo Cartão</h3>
              <p className="text-gray-600 text-lg">Cadastre um novo cartão de crédito ou débito</p>
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
                  className="w-full border-2 border-purple-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
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
                  Tipo de Cartão *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Card['type'] })}
                  className="w-full border-2 border-purple-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                >
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Limite *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-purple-100 p-2 rounded-lg">
                    <span className="text-purple-600 font-bold">R$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    className="w-full pl-16 pr-6 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white shadow-lg text-lg font-semibold hover:shadow-xl"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Valor Usado
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-purple-100 p-2 rounded-lg">
                    <span className="text-purple-600 font-bold">R$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.used}
                    onChange={(e) => setFormData({ ...formData, used: e.target.value })}
                    className="w-full pl-16 pr-6 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white shadow-lg text-lg font-semibold hover:shadow-xl"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {formData.type === 'credit' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    Dia do Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border-2 border-purple-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                    placeholder="Ex: 10"
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    Dia do Fechamento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.closingDate}
                    onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                    className="w-full border-2 border-purple-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                    placeholder="Ex: 5"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-base font-bold text-gray-800 mb-3">
                Nome Personalizado (opcional)
              </label>
              <input
                type="text"
                value={formData.customName}
                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                className="w-full border-2 border-purple-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                placeholder="Ex: Cartão Principal"
              />
            </div>

            <div className="flex gap-6 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300"
              >
                Adicionar Cartão
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

      {/* Lista de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const bankInfo = getBankInfo(card.bank);
          const isEditing = editingCard === card.id;
          const isBalanceVisible = showBalance[card.id];
          const usagePercentage = getUsagePercentage(card.used, card.limit);
          const availableCredit = getAvailableCredit(card);
          const daysUntilDue = getDaysUntilDue(card.dueDate);

          return (
            <div 
              key={card.id} 
              className={`bg-gradient-to-br ${bankInfo.color} ${bankInfo.textColor} p-6 rounded-2xl shadow-lg card-hover animate-slideIn relative overflow-hidden`}
            >
              {isEditing ? (
                /* Modo de Edição */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Editar Cartão</h3>
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
                    placeholder="Nome do cartão"
                  />
                  
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.limit}
                    onChange={(e) => setEditForm({ ...editForm, limit: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-70 text-sm"
                    placeholder="Limite"
                  />
                  
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.used}
                    onChange={(e) => setEditForm({ ...editForm, used: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-70 text-sm"
                    placeholder="Valor usado"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-70 text-sm"
                      placeholder="Vencimento"
                    />
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editForm.closingDate}
                      onChange={(e) => setEditForm({ ...editForm, closingDate: e.target.value })}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-70 text-sm"
                      placeholder="Fechamento"
                    />
                  </div>
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
                        {getCardTypeText(card.type)}
                      </span>
                    </div>
                    {onUpdateCard && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBalanceVisibility(card.id)}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEditCard(card)}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {card.type === 'credit' && onViewInvoice && (
                          <button
                            onClick={() => onViewInvoice(card)}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Ver fatura"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1">{card.name}</h3>
                    <p className="text-sm opacity-90">{bankInfo.name}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Limite e Uso */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Limite</span>
                        <span className="font-bold">
                          {isBalanceVisible ? formatCurrency(card.limit) : '••••••'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Usado</span>
                        <span className="font-bold">
                          {isBalanceVisible ? formatCurrency(card.used) : '••••••'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            usagePercentage > 80 ? 'bg-red-400' : 
                            usagePercentage > 60 ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Disponível</span>
                        <span className="font-bold">
                          {isBalanceVisible ? formatCurrency(availableCredit) : '••••••'}
                        </span>
                      </div>
                    </div>

                    {/* Informações de Vencimento */}
                    {card.type === 'credit' && (card.dueDate || card.closingDate) && (
                      <div className="pt-3 border-t border-white border-opacity-20">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {card.closingDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Fecha dia {card.closingDate}</span>
                            </div>
                          )}
                          {card.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Vence dia {card.dueDate}</span>
                            </div>
                          )}
                        </div>
                        
                        {daysUntilDue !== null && (
                          <div className="mt-2 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              daysUntilDue <= 3 ? 'bg-red-400 text-red-900' :
                              daysUntilDue <= 7 ? 'bg-yellow-400 text-yellow-900' :
                              'bg-green-400 text-green-900'
                            }`}>
                              {daysUntilDue === 0 ? 'Vence hoje!' :
                               daysUntilDue === 1 ? 'Vence amanhã' :
                               `${daysUntilDue} dias para vencer`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Utilização */}
                    <div className="text-center text-xs opacity-80">
                      {usagePercentage.toFixed(1)}% utilizado
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado vazio */}
      {cards.length === 0 && !showAddForm && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum cartão registrado</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comece adicionando seus cartões de crédito e débito para ter controle total dos seus gastos
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Adicionar Primeiro Cartão
          </button>
        </div>
      )}
    </div>
  );
};

export default CardsManager;