import React, { useState } from 'react';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Pause, Play, Edit3, Camera, Upload, AlertTriangle, Lightbulb } from 'lucide-react';
import { Goal } from '../types/financial';
import { useApp } from '../contexts/AppContext';
import { defaultCategories } from '../data/categories';

interface GoalsManagerProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
}

export const GoalsManager: React.FC<GoalsManagerProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal
}) => {
  const { formatCurrency } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetAmount: '',
    currentAmount: '',
    monthlyContribution: '',
    targetDate: '',
    category: '',
    priority: 'medium' as Goal['priority']
  });

  const calculateTimeToGoal = (targetAmount: number, currentAmount: number, monthlyContribution: number) => {
    if (monthlyContribution <= 0) return 0;
    return Math.ceil((targetAmount - currentAmount) / monthlyContribution);
  };

  const isGoalRealistic = (targetAmount: number, currentAmount: number, monthlyContribution: number, targetDate: string) => {
    const monthsNeeded = calculateTimeToGoal(targetAmount, currentAmount, monthlyContribution);
    const targetDateObj = new Date(targetDate);
    const today = new Date();
    const monthsAvailable = Math.ceil((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return monthsNeeded <= monthsAvailable;
  };

  const getRequiredMonthlyAmount = (targetAmount: number, currentAmount: number, targetDate: string) => {
    const targetDateObj = new Date(targetDate);
    const today = new Date();
    const monthsAvailable = Math.ceil((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthsAvailable <= 0) return 0;
    return Math.ceil((targetAmount - currentAmount) / monthsAvailable);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.targetAmount && formData.targetDate && formData.monthlyContribution && formData.category) {
      const goalData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || '0'),
        monthlyContribution: parseFloat(formData.monthlyContribution || '0'),
        targetDate: formData.targetDate,
        category: formData.category,
        priority: formData.priority,
        status: 'active' as const
      };

      if (editingGoal) {
        onUpdateGoal(editingGoal, goalData);
        setEditingGoal(null);
      } else {
        onAddGoal(goalData);
      }
      
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        targetAmount: '',
        currentAmount: '',
        monthlyContribution: '',
        targetDate: '',
        category: '',
        priority: 'medium'
      });
      setShowAddForm(false);
    }
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      imageUrl: goal.imageUrl || '',
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      monthlyContribution: goal.monthlyContribution.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority
    });
    setEditingGoal(goal.id);
    setShowAddForm(true);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Minhas Metas</h2>
          <p className="text-gray-600">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Nova Meta
        </button>
      </div>

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-scaleIn">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Editar Meta' : 'Adicionar Nova Meta'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload de Imagem da Meta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem da Meta (opcional)
              </label>
              <div className="flex items-center gap-4">
                {formData.imageUrl && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    <img 
                      src={formData.imageUrl} 
                      alt="Meta" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setFormData({ ...formData, imageUrl: result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="goal-image-upload"
                  />
                  <label
                    htmlFor="goal-image-upload"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {formData.imageUrl ? 'Alterar Imagem' : 'Escolher Imagem'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Faça upload de uma imagem que represente sua meta
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Meta *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Viagem para Europa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Objetivo *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Atual
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contribuição Mensal *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Objetivo *
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {defaultCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Goal['priority'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descreva sua meta..."
              />
            </div>

            {/* Real-time Calculation */}
            {formData.targetAmount && formData.currentAmount && formData.monthlyContribution && formData.targetDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Análise da Meta
                </h4>
                {(() => {
                  const targetAmount = parseFloat(formData.targetAmount);
                  const currentAmount = parseFloat(formData.currentAmount || '0');
                  const monthlyContribution = parseFloat(formData.monthlyContribution);
                  const monthsNeeded = calculateTimeToGoal(targetAmount, currentAmount, monthlyContribution);
                  const isRealistic = isGoalRealistic(targetAmount, currentAmount, monthlyContribution, formData.targetDate);
                  const requiredMonthly = getRequiredMonthlyAmount(targetAmount, currentAmount, formData.targetDate);

                  return (
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-800">
                        <strong>Tempo estimado:</strong> {monthsNeeded} meses
                      </p>
                      {!isRealistic ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="flex items-center gap-2 text-yellow-800 mb-1">
                            <AlertTriangle className="h-4 w-4" />
                            <strong>Atenção!</strong>
                          </div>
                          <p className="text-yellow-700">
                            Para alcançar sua meta até {new Date(formData.targetDate).toLocaleDateString('pt-PT')}, 
                            você precisaria poupar <strong>€{requiredMonthly.toFixed(2)}/mês</strong> em vez de €{monthlyContribution.toFixed(2)}/mês.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="flex items-center gap-2 text-green-800 mb-1">
                            <CheckCircle className="h-4 w-4" />
                            <strong>Parabéns!</strong>
                          </div>
                          <p className="text-green-700">
                            Você alcançará sua meta antes do prazo estabelecido!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {editingGoal ? 'Atualizar Meta' : 'Adicionar Meta'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGoal(null);
                  setFormData({
                    title: '',
                    description: '',
                    imageUrl: '',
                    targetAmount: '',
                    currentAmount: '',
                    monthlyContribution: '',
                    targetDate: '',
                    category: '',
                    priority: 'medium'
                  });
                }}
                className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
          const daysRemaining = getDaysRemaining(goal.targetDate);
          const isCompleted = progress >= 100;
          const isOverdue = daysRemaining < 0 && !isCompleted;
          const monthsNeeded = calculateTimeToGoal(goal.targetAmount, goal.currentAmount, goal.monthlyContribution);

          return (
            <div key={goal.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover animate-slideIn">
              {/* Goal Image */}
              {goal.imageUrl && (
                <div className="h-32 overflow-hidden">
                  <img 
                    src={goal.imageUrl} 
                    alt={goal.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                      {getPriorityText(goal.priority)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-gray-400 hover:text-blue-600 p-1"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onUpdateGoal(goal.id, { 
                        status: goal.status === 'active' ? 'paused' : 'active' 
                      })}
                      className="text-gray-400 hover:text-yellow-600 p-1"
                    >
                      {goal.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{getCategoryName(goal.category)}</p>
                {goal.description && (
                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progresso</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="font-medium text-blue-600">
                      €{goal.monthlyContribution.toFixed(2)}/mês
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${
                      isOverdue ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Concluída!
                        </span>
                      ) : isOverdue ? (
                        `${Math.abs(daysRemaining)} dias em atraso`
                      ) : (
                        `${daysRemaining} dias restantes`
                      )}
                    </span>
                    <span className="text-gray-500">
                      ~{monthsNeeded} meses
                    </span>
                  </div>

                  {goal.aiSuggestion && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-800 mb-1">
                        <Lightbulb className="h-4 w-4" />
                        <strong>Sugestão IA</strong>
                      </div>
                      <p className="text-yellow-700 text-sm">{goal.aiSuggestion}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(goal.targetDate).toLocaleDateString('pt-PT')}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'active' ? 'text-green-600 bg-green-100' :
                      goal.status === 'completed' ? 'text-blue-600 bg-blue-100' :
                      'text-gray-600 bg-gray-100'
                    }`}>
                      {goal.status === 'active' ? 'Ativa' : 
                       goal.status === 'completed' ? 'Concluída' : 'Pausada'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma meta definida</h3>
          <p className="text-gray-600 mb-4">Comece a definir seus objetivos financeiros</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Criar Primeira Meta
          </button>
        </div>
      )}
    </div>
  );
};