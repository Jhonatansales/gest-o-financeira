import React, { useState } from 'react';
import { Shield, Plus, AlertTriangle, CheckCircle, TrendingUp, Edit3, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { Limit } from '../types/financial';
import { useApp } from '../contexts/AppContext';
import { defaultCategories } from '../data/categories';

interface LimitsManagerProps {
  limits: Limit[];
  onAddLimit: (limit: Omit<Limit, 'id' | 'createdAt' | 'resetDate'>) => void;
  onUpdateLimit: (limitId: string, updates: Partial<Limit>) => void;
}

export const LimitsManager: React.FC<LimitsManagerProps> = ({
  limits,
  onAddLimit,
  onUpdateLimit
}) => {
  const { formatCurrency } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    limitAmount: '',
    period: 'monthly' as Limit['period'],
    alertThreshold: '80',
    startDate: new Date().toISOString().split('T')[0],
    startType: 'today' as Limit['startType']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.category && formData.limitAmount) {
      let actualStartDate = formData.startDate;
      
      // Ajustar data de início baseado no tipo selecionado
      if (formData.startType === 'first_day') {
        const date = new Date(formData.startDate);
        date.setDate(1);
        actualStartDate = date.toISOString().split('T')[0];
      } else if (formData.startType === 'last_day') {
        const date = new Date(formData.startDate);
        date.setMonth(date.getMonth() + 1, 0); // Último dia do mês
        actualStartDate = date.toISOString().split('T')[0];
      }

      const limitData = {
        title: formData.title,
        category: formData.category,
        subcategory: formData.subcategory,
        limitAmount: parseFloat(formData.limitAmount),
        currentAmount: 0,
        period: formData.period,
        alertThreshold: parseInt(formData.alertThreshold),
        isActive: true,
        startDate: actualStartDate,
        startType: formData.startType
      };

      if (editingLimit) {
        onUpdateLimit(editingLimit, limitData);
        setEditingLimit(null);
      } else {
        onAddLimit(limitData);
      }
      
      setFormData({
        title: '',
        category: '',
        subcategory: '',
        limitAmount: '',
        period: 'monthly',
        alertThreshold: '80',
        startDate: new Date().toISOString().split('T')[0],
        startType: 'today'
      });
      setShowAddForm(false);
    }
  };

  const handleEdit = (limit: Limit) => {
    setFormData({
      title: limit.title,
      category: limit.category,
      subcategory: limit.subcategory || '',
      limitAmount: limit.limitAmount.toString(),
      period: limit.period,
      alertThreshold: limit.alertThreshold.toString(),
      startDate: limit.startDate,
      startType: limit.startType
    });
    setEditingLimit(limit.id);
    setShowAddForm(true);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getStatusColor = (percentage: number, alertThreshold: number) => {
    if (percentage >= 100) return 'text-red-600 bg-red-100';
    if (percentage >= alertThreshold) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = (percentage: number, alertThreshold: number) => {
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4" />;
    if (percentage >= alertThreshold) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = (percentage: number, alertThreshold: number) => {
    if (percentage >= 100) return 'Limite Excedido';
    if (percentage >= alertThreshold) return 'Próximo do Limite';
    return 'Dentro do Limite';
  };

  const getPeriodText = (period: Limit['period']) => {
    switch (period) {
      case 'monthly': return 'Mensal';
      case 'biweekly': return 'Quinzenal';
      case 'bimonthly': return 'Bimestral';
      case 'quarterly': return 'Trimestral';
      case 'semiannual': return 'Semestral';
      case 'annual': return 'Anual';
      default: return period;
    }
  };

  const getStartTypeText = (startType: Limit['startType']) => {
    switch (startType) {
      case 'today': return 'Hoje';
      case 'first_day': return 'Primeiro dia do mês';
      case 'last_day': return 'Último dia do mês';
      default: return startType;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
    return subcategory?.name || subcategoryId;
  };

  const getDaysUntilReset = (resetDate: string) => {
    const today = new Date();
    const reset = new Date(resetDate);
    const diffTime = reset.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const selectedCategory = defaultCategories.find(cat => cat.id === formData.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Limites</h2>
          <p className="text-gray-600">Controle seus gastos com limites personalizados</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Novo Limite
        </button>
      </div>

      {/* Add/Edit Limit Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl p-8 animate-scaleIn border-2 border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingLimit ? 'Editar Limite' : 'Adicionar Novo Limite'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Título do Limite *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                  placeholder="Ex: Limite de Alimentação"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                  className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {defaultCategories
                    .filter(cat => cat.type === 'expense' || cat.type === 'both')
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Subcategoria (se disponível) */}
            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Subcategoria (opcional)
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                >
                  <option value="">Todas as subcategorias</option>
                  {selectedCategory.subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Valor Limite *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-orange-100 p-2 rounded-lg">
                    <span className="text-orange-600 font-bold">R$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limitAmount}
                    onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                    className="w-full pl-16 pr-6 py-4 border-2 border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-semibold hover:shadow-xl"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Recorrência *
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as Limit['period'] })}
                  className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                >
                  <option value="monthly">Mensal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="bimonthly">Bimestral</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="semiannual">Semestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-800 mb-3">
                  Tipo de Início *
                </label>
                <select
                  value={formData.startType}
                  onChange={(e) => setFormData({ ...formData, startType: e.target.value as Limit['startType'] })}
                  className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                >
                  <option value="today">Hoje</option>
                  <option value="first_day">Primeiro dia do mês</option>
                  <option value="last_day">Último dia do mês</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-800 mb-3">
                Alerta em (%) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                className="w-full border-2 border-orange-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 bg-white shadow-lg text-lg font-medium hover:shadow-xl"
                placeholder="80"
                required
              />
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Você será alertado quando atingir esta porcentagem do limite
              </p>
            </div>

            <div className="flex gap-6 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300"
              >
                {editingLimit ? 'Atualizar Limite' : 'Adicionar Limite'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLimit(null);
                  setFormData({
                    title: '',
                    category: '',
                    subcategory: '',
                    limitAmount: '',
                    period: 'monthly',
                    alertThreshold: '80',
                    startDate: new Date().toISOString().split('T')[0],
                    startType: 'today'
                  });
                }}
                className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Limits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {limits.map((limit) => {
          const usagePercentage = getUsagePercentage(limit.currentAmount, limit.limitAmount);
          const daysUntilReset = getDaysUntilReset(limit.resetDate);
          const remaining = limit.limitAmount - limit.currentAmount;

          return (
            <div key={limit.id} className="bg-white rounded-2xl shadow-lg p-6 card-hover animate-slideIn">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(usagePercentage, limit.alertThreshold)}`}>
                    {getStatusIcon(usagePercentage, limit.alertThreshold)}
                    <span>{getStatusText(usagePercentage, limit.alertThreshold)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(limit)}
                    className="text-gray-400 hover:text-blue-600 p-1"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onUpdateLimit(limit.id, { isActive: !limit.isActive })}
                    className="text-gray-400 hover:text-orange-600 p-1"
                  >
                    {limit.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{limit.title}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {getCategoryName(limit.category)}
                {limit.subcategory && ` > ${getSubcategoryName(limit.category, limit.subcategory)}`}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Utilização</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {usagePercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      usagePercentage >= 100 ? 'bg-red-500' : 
                      usagePercentage >= limit.alertThreshold ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {formatCurrency(limit.currentAmount)} / {formatCurrency(limit.limitAmount)}
                  </span>
                  <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remaining >= 0 ? 'Restam ' : 'Excesso '}{formatCurrency(Math.abs(remaining))}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3" />
                    {getPeriodText(limit.period)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {daysUntilReset > 0 ? `Reset em ${daysUntilReset} dias` : 'Resetando...'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    limit.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                  }`}>
                    {limit.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(limit.startDate).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="text-center mt-1">
                      {getStartTypeText(limit.startType)}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    Alerta: {limit.alertThreshold}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {limits.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum limite definido</h3>
          <p className="text-gray-600 mb-4">Comece a controlar seus gastos com limites personalizados</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Criar Primeiro Limite
          </button>
        </div>
      )}
    </div>
  );
};