import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, CreditCard, Wallet, DollarSign, CheckCircle, PieChart, BarChart3, Calendar, Target, Activity, Shield, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Account, Card, Transaction, Goal, Limit } from '../types/financial';
import { defaultCategories } from '../data/categories';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { CashFlowBarChart } from './charts/CashFlowBarChart';
import { BalanceAreaChart } from './charts/BalanceAreaChart';

interface FinancialOverviewProps {
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  goals: Goal[];
  limits: Limit[];
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalReceived: number;
    totalPaid: number;
  };
  onNavigateToAccounts?: () => void;
  onNavigateToHistory?: (filter?: 'income' | 'expense') => void;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  accounts,
  cards,
  transactions,
  goals,
  limits,
  summary,
  onNavigateToAccounts,
  onNavigateToHistory
}) => {
  const { formatCurrency, t, settings } = useApp();

  // Preparação dos dados para gráficos
  const chartData = useMemo(() => {
    // Dados para gráfico de categorias (despesas)
    const categoryExpenses: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = defaultCategories.find(cat => cat.id === transaction.category);
        const categoryName = category?.name || transaction.category;
        categoryExpenses[categoryName] = (categoryExpenses[categoryName] || 0) + transaction.amount;
      });

    const categoryData = Object.entries(categoryExpenses)
      .map(([name, value]) => ({ name, value, color: '' }))
      .sort((a, b) => b.value - a.value);

    // Dados para fluxo de caixa (últimos 6 meses)
    const monthlyData: { [key: string]: { receitas: number; despesas: number } } = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // YYYY-MM
    }).reverse();

    last6Months.forEach(month => {
      monthlyData[month] = { receitas: 0, despesas: 0 };
    });

    transactions.forEach(transaction => {
      const month = transaction.date.slice(0, 7);
      if (monthlyData[month]) {
        if (transaction.type === 'income') {
          monthlyData[month].receitas += transaction.amount;
        } else if (transaction.type === 'expense') {
          monthlyData[month].despesas += transaction.amount;
        }
      }
    });

    const cashFlowData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-PT', { month: 'short' }),
        receitas: data.receitas,
        despesas: data.despesas
      }));

    // Dados para evolução do saldo
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const initialBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    let runningBalance = initialBalance;
    const balanceData: { date: string; saldo: number }[] = [];

    // Adicionar ponto inicial
    if (sortedTransactions.length > 0) {
      const firstDate = new Date(sortedTransactions[0].date);
      firstDate.setDate(firstDate.getDate() - 1);
      balanceData.push({
        date: firstDate.toISOString().split('T')[0],
        saldo: initialBalance
      });
    }

    sortedTransactions.forEach(transaction => {
      if (transaction.type === 'income' && transaction.status === 'received') {
        runningBalance += transaction.amount;
      } else if (transaction.type === 'expense' && transaction.status === 'paid') {
        runningBalance -= transaction.amount;
      }
      
      balanceData.push({
        date: transaction.date,
        saldo: runningBalance
      });
    });

    return { categoryData, cashFlowData, balanceData };
  }, [transactions, accounts]);

  // Análise de metas e limites
  const goalsAnalysis = useMemo(() => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    const totalGoalAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSavedAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const averageProgress = activeGoals.length > 0 ? 
      activeGoals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / activeGoals.length : 0;

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalGoalAmount,
      totalSavedAmount,
      averageProgress
    };
  }, [goals]);

  const limitsAnalysis = useMemo(() => {
    const activeLimits = limits.filter(limit => limit.isActive);
    const exceededLimits = activeLimits.filter(limit => limit.currentAmount > limit.limitAmount);
    const nearLimits = activeLimits.filter(limit => 
      (limit.currentAmount / limit.limitAmount * 100) >= limit.alertThreshold && 
      limit.currentAmount <= limit.limitAmount
    );

    return {
      activeLimits: activeLimits.length,
      exceededLimits: exceededLimits.length,
      nearLimits: nearLimits.length,
      totalLimitAmount: activeLimits.reduce((sum, limit) => sum + limit.limitAmount, 0),
      totalUsedAmount: activeLimits.reduce((sum, limit) => sum + limit.currentAmount, 0)
    };
  }, [limits]);

  // Análise de dados para relatórios
  const getAnnualData = () => {
    const currentYear = new Date().getFullYear();
    const annualIncome = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentYear.toString()))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const annualExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentYear.toString()))
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { annualIncome, annualExpenses };
  };

  const getLayoutClass = () => {
    switch (settings.layout) {
      case 'compact':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4';
      case 'modern':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8';
      case 'classic':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6';
      case 'minimal':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6';
    }
  };

  const getCardClass = () => {
    switch (settings.layout) {
      case 'compact':
        return 'p-4 lg:p-4 rounded-xl lg:rounded-lg shadow-md';
      case 'modern':
        return 'p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl transform hover:scale-105';
      case 'classic':
        return 'p-4 lg:p-6 rounded-xl lg:rounded-lg border-2 border-gray-200 shadow-sm';
      case 'minimal':
        return 'p-4 lg:p-3 rounded-xl lg:rounded border border-gray-300';
      default:
        return 'p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg card-hover';
    }
  };

  const { annualIncome, annualExpenses } = getAnnualData();

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className={`grid ${getLayoutClass()}`}>
        <button 
          onClick={onNavigateToAccounts}
          className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white ${getCardClass()} cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 text-left`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('overview.totalBalance')}</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalBalance)}</p>
            </div>
            <Wallet className="h-10 w-10 text-blue-200" />
          </div>
        </button>

        <button 
          onClick={() => onNavigateToHistory?.('income')}
          className={`bg-gradient-to-br from-green-500 to-green-600 text-white ${getCardClass()} cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 text-left`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('overview.monthlyIncome')}</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.monthlyIncome)}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-200" />
          </div>
        </button>

        <button 
          onClick={() => onNavigateToHistory?.('expense')}
          className={`bg-gradient-to-br from-red-500 to-red-600 text-white ${getCardClass()} cursor-pointer hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 text-left`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">{t('overview.monthlyExpenses')}</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.monthlyExpenses)}</p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-200" />
          </div>
        </button>

        <div className={`bg-gradient-to-br from-purple-500 to-purple-600 text-white ${getCardClass()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('overview.totalReceived')}</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalReceived)}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className={`bg-gradient-to-br from-orange-500 to-orange-600 text-white ${getCardClass()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">{t('overview.totalPaid')}</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Metas e Limites Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Metas Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-full">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Minhas Metas</h3>
              <p className="text-gray-600 text-sm">Progresso dos objetivos</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Metas Ativas</span>
              <span className="font-semibold text-gray-900">{goalsAnalysis.activeGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Metas Concluídas</span>
              <span className="font-semibold text-green-600">{goalsAnalysis.completedGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Progresso Médio</span>
              <span className="font-semibold text-blue-600">{goalsAnalysis.averageProgress.toFixed(1)}%</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Poupado / Objetivo</span>
                <span className="font-medium">
                  {formatCurrency(goalsAnalysis.totalSavedAmount)} / {formatCurrency(goalsAnalysis.totalGoalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Limites Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Meus Limites</h3>
              <p className="text-gray-600 text-sm">Controle de gastos</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Limites Ativos</span>
              <span className="font-semibold text-gray-900">{limitsAnalysis.activeLimits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Próximos do Limite</span>
              <span className="font-semibold text-yellow-600 flex items-center gap-1">
                {limitsAnalysis.nearLimits > 0 && <AlertTriangle className="h-4 w-4" />}
                {limitsAnalysis.nearLimits}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Limites Excedidos</span>
              <span className="font-semibold text-red-600 flex items-center gap-1">
                {limitsAnalysis.exceededLimits > 0 && <AlertTriangle className="h-4 w-4" />}
                {limitsAnalysis.exceededLimits}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Usado / Limite Total</span>
                <span className="font-medium">
                  {formatCurrency(limitsAnalysis.totalUsedAmount)} / {formatCurrency(limitsAnalysis.totalLimitAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
        {/* Gráfico de Despesas por Categoria */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-3 rounded-full">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Despesas por Categoria</h3>
              <p className="text-gray-600 text-sm">Análise dos seus gastos</p>
            </div>
          </div>
          <CategoryDonutChart 
            data={chartData.categoryData} 
            totalAmount={summary.monthlyExpenses}
          />
        </div>

        {/* Gráfico de Fluxo de Caixa */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Fluxo de Caixa</h3>
              <p className="text-gray-600 text-sm">Últimos 6 meses</p>
            </div>
          </div>
          <CashFlowBarChart data={chartData.cashFlowData} />
        </div>

        {/* Gráfico de Evolução do Saldo */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 lg:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-full">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Evolução do Saldo</h3>
              <p className="text-gray-600 text-sm">Histórico do património</p>
            </div>
          </div>
          <BalanceAreaChart data={chartData.balanceData} />
        </div>
      </div>

      {/* Relatório Anual */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatório Anual {new Date().getFullYear()}</h2>
            <p className="text-gray-600">Visão completa do ano fiscal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 lg:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-200" />
              <Target className="h-6 w-6 text-green-200" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Receitas Anuais</h3>
            <p className="text-3xl font-bold">{formatCurrency(annualIncome)}</p>
            <p className="text-green-200 text-sm mt-2">
              Média mensal: {formatCurrency(annualIncome / 12)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 lg:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="h-8 w-8 text-red-200" />
              <Target className="h-6 w-6 text-red-200" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Despesas Anuais</h3>
            <p className="text-3xl font-bold">{formatCurrency(annualExpenses)}</p>
            <p className="text-red-200 text-sm mt-2">
              Média mensal: {formatCurrency(annualExpenses / 12)}
            </p>
          </div>

          <div className={`${annualIncome - annualExpenses >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} text-white p-4 lg:p-6 rounded-xl`}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-white opacity-80" />
              <Target className="h-6 w-6 text-white opacity-80" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Saldo Anual</h3>
            <p className="text-3xl font-bold">
              {annualIncome - annualExpenses >= 0 ? '+' : ''}
              {formatCurrency(annualIncome - annualExpenses)}
            </p>
            <p className="text-white opacity-80 text-sm mt-2">
              {annualIncome - annualExpenses >= 0 ? 'Superávit' : 'Déficit'} de {((Math.abs(annualIncome - annualExpenses) / Math.max(annualIncome, 1)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Accounts Summary */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 card-hover">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-blue-500" />
            Resumo de Contas
          </h3>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">{account.name}</span>
                <span className="font-bold text-gray-900">{formatCurrency(account.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cards Summary */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 card-hover">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
            Resumo de Cartões
          </h3>
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{card.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(card.used)} / {formatCurrency(card.limit)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((card.used / card.limit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};