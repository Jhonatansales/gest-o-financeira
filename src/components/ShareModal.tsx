import React, { useState } from 'react';
import { X, Share2, Mail, Download, Calendar, Filter, FileText, Smartphone, Monitor } from 'lucide-react';
import { Account, Card, Transaction, Goal, Limit } from '../types/financial';
import { useApp } from '../contexts/AppContext';
import { defaultCategories } from '../data/categories';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

type ShareContent = 'summary' | 'accounts' | 'cards' | 'transactions' | 'goals' | 'limits' | 'custom';
type ShareMethod = 'email' | 'download' | 'native';
type TransactionPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  accounts,
  cards,
  transactions,
  goals,
  limits,
  summary
}) => {
  const { formatCurrency } = useApp();
  const [selectedContent, setSelectedContent] = useState<ShareContent>('summary');
  const [shareMethod, setShareMethod] = useState<ShareMethod>('email');
  const [transactionPeriod, setTransactionPeriod] = useState<TransactionPeriod>('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'Relatório Financeiro - Gestor Pro',
    message: 'Segue em anexo o meu relatório financeiro.'
  });

  // Detectar se é mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate: Date;

    switch (transactionPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'custom':
        startDate = new Date(customDateRange.startDate);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const endDate = transactionPeriod === 'custom' ? new Date(customDateRange.endDate) : now;

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const getCategoryName = (categoryId: string, subcategoryId?: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    if (category && subcategoryId) {
      const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      return subcategory ? `${category.name} > ${subcategory.name}` : category.name;
    }
    return category?.name || categoryId;
  };

  const getPaymentSourceName = (transaction: Transaction) => {
    if (transaction.paymentMethod === 'cash') return 'Dinheiro';
    if (transaction.paymentMethod === 'pix') return 'PIX';
    if (transaction.paymentMethod === 'account') {
      const account = accounts.find(a => a.id === transaction.paymentSource);
      return account?.name || 'Conta';
    }
    if (transaction.paymentMethod === 'card') {
      const card = cards.find(c => c.id === transaction.paymentSource);
      return card?.name || 'Cartão';
    }
    return '-';
  };

  const generateReportContent = () => {
    const filteredTransactions = selectedContent === 'transactions' ? getFilteredTransactions() : transactions;
    const reportDate = new Date().toLocaleDateString('pt-PT');
    
    let content = `RELATÓRIO FINANCEIRO - GESTOR PRO\n`;
    content += `Gerado em: ${reportDate}\n`;
    content += `${'='.repeat(50)}\n\n`;

    if (selectedContent === 'summary' || selectedContent === 'custom') {
      content += `RESUMO GERAL\n`;
      content += `${'-'.repeat(20)}\n`;
      content += `Saldo Total: ${formatCurrency(summary.totalBalance)}\n`;
      content += `Receitas (Mês): ${formatCurrency(summary.monthlyIncome)}\n`;
      content += `Despesas (Mês): ${formatCurrency(summary.monthlyExpenses)}\n`;
      content += `Total Recebido: ${formatCurrency(summary.totalReceived)}\n`;
      content += `Total Pago: ${formatCurrency(summary.totalPaid)}\n`;
      content += `Saldo Mensal: ${formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}\n\n`;
    }

    if (selectedContent === 'accounts' || selectedContent === 'custom') {
      content += `CONTAS BANCÁRIAS (${accounts.length})\n`;
      content += `${'-'.repeat(30)}\n`;
      accounts.forEach(account => {
        content += `• ${account.name}\n`;
        content += `  Saldo: ${formatCurrency(account.balance)}\n`;
        content += `  Tipo: ${account.type === 'checking' ? 'Conta Corrente' : account.type === 'savings' ? 'Poupança' : 'Investimento'}\n`;
        if (account.bank) content += `  Banco: ${account.bank}\n`;
        content += `\n`;
      });
    }

    if (selectedContent === 'cards' || selectedContent === 'custom') {
      content += `CARTÕES (${cards.length})\n`;
      content += `${'-'.repeat(20)}\n`;
      cards.forEach(card => {
        const usage = card.limit > 0 ? ((card.used / card.limit) * 100).toFixed(1) : '0';
        content += `• ${card.name}\n`;
        content += `  Limite: ${formatCurrency(card.limit)}\n`;
        content += `  Usado: ${formatCurrency(card.used)} (${usage}%)\n`;
        content += `  Disponível: ${formatCurrency(card.limit - card.used)}\n`;
        content += `  Tipo: ${card.type === 'credit' ? 'Crédito' : 'Débito'}\n`;
        if (card.dueDate) content += `  Vencimento: dia ${card.dueDate}\n`;
        if (card.closingDate) content += `  Fechamento: dia ${card.closingDate}\n`;
        content += `\n`;
      });
    }

    if (selectedContent === 'goals' || selectedContent === 'custom') {
      content += `METAS FINANCEIRAS (${goals.length})\n`;
      content += `${'-'.repeat(35)}\n`;
      goals.forEach(goal => {
        const progress = goal.targetAmount > 0 ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1) : '0';
        content += `• ${goal.title}\n`;
        content += `  Objetivo: ${formatCurrency(goal.targetAmount)}\n`;
        content += `  Atual: ${formatCurrency(goal.currentAmount)} (${progress}%)\n`;
        content += `  Contribuição Mensal: ${formatCurrency(goal.monthlyContribution)}\n`;
        content += `  Data Objetivo: ${new Date(goal.targetDate).toLocaleDateString('pt-PT')}\n`;
        content += `  Status: ${goal.status === 'active' ? 'Ativa' : goal.status === 'completed' ? 'Concluída' : 'Pausada'}\n`;
        content += `  Prioridade: ${goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}\n`;
        content += `\n`;
      });
    }

    if (selectedContent === 'limits' || selectedContent === 'custom') {
      content += `LIMITES DE GASTOS (${limits.length})\n`;
      content += `${'-'.repeat(35)}\n`;
      limits.forEach(limit => {
        const usage = limit.limitAmount > 0 ? ((limit.currentAmount / limit.limitAmount) * 100).toFixed(1) : '0';
        content += `• ${limit.title}\n`;
        content += `  Limite: ${formatCurrency(limit.limitAmount)}\n`;
        content += `  Usado: ${formatCurrency(limit.currentAmount)} (${usage}%)\n`;
        content += `  Restante: ${formatCurrency(limit.limitAmount - limit.currentAmount)}\n`;
        content += `  Período: ${limit.period}\n`;
        content += `  Status: ${limit.isActive ? 'Ativo' : 'Inativo'}\n`;
        content += `  Alerta em: ${limit.alertThreshold}%\n`;
        content += `\n`;
      });
    }

    if (selectedContent === 'transactions' || selectedContent === 'custom') {
      const periodText = transactionPeriod === 'custom' 
        ? `${new Date(customDateRange.startDate).toLocaleDateString('pt-PT')} a ${new Date(customDateRange.endDate).toLocaleDateString('pt-PT')}`
        : transactionPeriod === 'week' ? 'Última semana'
        : transactionPeriod === 'month' ? 'Último mês'
        : transactionPeriod === 'quarter' ? 'Últimos 3 meses'
        : 'Último ano';

      content += `HISTÓRICO DE TRANSAÇÕES - ${periodText.toUpperCase()}\n`;
      content += `${'-'.repeat(50)}\n`;
      
      const periodTransactions = getFilteredTransactions();
      const totalIncome = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      content += `Resumo do Período:\n`;
      content += `Receitas: ${formatCurrency(totalIncome)}\n`;
      content += `Despesas: ${formatCurrency(totalExpenses)}\n`;
      content += `Saldo: ${formatCurrency(totalIncome - totalExpenses)}\n`;
      content += `Total de transações: ${periodTransactions.length}\n\n`;

      content += `Detalhes das Transações:\n`;
      periodTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .forEach(transaction => {
          const typeSymbol = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '↔';
          content += `${new Date(transaction.date).toLocaleDateString('pt-PT')} | ${typeSymbol}${formatCurrency(transaction.amount)} | ${transaction.title}\n`;
          content += `  Categoria: ${getCategoryName(transaction.category, transaction.subcategory)}\n`;
          content += `  Pagamento: ${getPaymentSourceName(transaction)}\n`;
          if (transaction.description) content += `  Descrição: ${transaction.description}\n`;
          content += `\n`;
        });
    }

    return content;
  };

  const handleShare = async () => {
    const content = generateReportContent();
    
    if (shareMethod === 'download') {
      // Download como arquivo de texto
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } else if (shareMethod === 'email') {
      // Compartilhar por email
      const subject = encodeURIComponent(emailData.subject);
      const body = encodeURIComponent(`${emailData.message}\n\n${content}`);
      const mailtoLink = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      window.open(mailtoLink);
      
    } else if (shareMethod === 'native' && navigator.share) {
      // API nativa de compartilhamento (mobile)
      try {
        await navigator.share({
          title: 'Relatório Financeiro - Gestor Pro',
          text: content
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        // Fallback para download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Compartilhar Relatório</h2>
                <p className="text-white text-opacity-90">Exporte e compartilhe seus dados financeiros</p>
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
          {/* Seleção de Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Conteúdo do Relatório</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'summary', label: 'Resumo Geral', icon: '📊' },
                { id: 'accounts', label: 'Contas', icon: '🏦' },
                { id: 'cards', label: 'Cartões', icon: '💳' },
                { id: 'transactions', label: 'Transações', icon: '📝' },
                { id: 'goals', label: 'Metas', icon: '🎯' },
                { id: 'limits', label: 'Limites', icon: '🛡️' },
                { id: 'custom', label: 'Relatório Completo', icon: '📋' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedContent(option.id as ShareContent)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    selectedContent === option.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Configurações de Período (apenas para transações) */}
          {(selectedContent === 'transactions' || selectedContent === 'custom') && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Período das Transações</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {[
                  { id: 'week', label: 'Última Semana' },
                  { id: 'month', label: 'Último Mês' },
                  { id: 'quarter', label: 'Últimos 3 Meses' },
                  { id: 'year', label: 'Último Ano' },
                  { id: 'custom', label: 'Período Personalizado' }
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setTransactionPeriod(period.id as TransactionPeriod)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                      transactionPeriod === period.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {transactionPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Método de Compartilhamento */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Como Compartilhar</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Email */}
              <button
                onClick={() => setShareMethod('email')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                  shareMethod === 'email'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Email</div>
                  <div className="text-sm opacity-80">Enviar por email</div>
                </div>
              </button>

              {/* Download */}
              <button
                onClick={() => setShareMethod('download')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                  shareMethod === 'download'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Download</div>
                  <div className="text-sm opacity-80">Baixar arquivo</div>
                </div>
              </button>

              {/* Compartilhamento Nativo (Mobile) */}
              {isMobile && navigator.share && (
                <button
                  onClick={() => setShareMethod('native')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    shareMethod === 'native'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Apps</div>
                    <div className="text-sm opacity-80">Compartilhar via apps</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Configurações de Email */}
          {shareMethod === 'email' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações do Email</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Para (Email)</label>
                  <input
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="destinatario@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview do Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pré-visualização</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {generateReportContent().substring(0, 1000)}
                {generateReportContent().length > 1000 && '...\n\n[Conteúdo truncado para pré-visualização]'}
              </pre>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Share2 className="h-5 w-5" />
              {shareMethod === 'email' ? 'Enviar por Email' : 
               shareMethod === 'download' ? 'Baixar Relatório' : 
               'Compartilhar'}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};