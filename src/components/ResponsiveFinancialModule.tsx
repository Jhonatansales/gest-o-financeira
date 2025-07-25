import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  History, 
  Target, 
  Shield, 
  User as UserIcon,
  Menu,
  X,
  Plus,
  LogOut,
  Bell,
  Search,
  Settings,
  Home,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFinancialData } from '../hooks/useFinancialData';
import { FinancialOverview } from './FinancialOverview';
import { AccountsManager } from './AccountsManager';
import { CardsManager } from './CardsManager';
import { TransactionsHistory } from './TransactionsHistory';
import { GoalsManager } from './GoalsManager';
import { LimitsManager } from './LimitsManager';
import { ProfileTab } from './ProfileTab';
import { CategoriesManager } from './CategoriesManager';
import { NewTransactionModal } from './NewTransactionModal';
import { AIChat } from './AIChat';
import { QuickOptionsMenu } from './QuickOptionsMenu';

type ActiveSection = 'overview' | 'accounts' | 'cards' | 'history' | 'goals' | 'limits' | 'categories' | 'profile';

export const ResponsiveFinancialModule: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'income' | 'expense'>('all');

  const {
    accounts,
    cards,
    transactions,
    goals,
    limits,
    customCategories,
    addTransaction,
    updateTransaction,
    addCustomCategory,
    addCustomSubcategory,
    addAccount,
    updateAccount,
    addCard,
    updateCard,
    addGoal,
    updateGoal,
    addLimit,
    updateLimit,
    resetAllData,
    getFinancialSummary
  } = useFinancialData();

  const summary = getFinancialSummary();

  // Detectar se é mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Callback para navegação com filtros
  const handleNavigationWithFilter = useCallback((section: ActiveSection, filter?: 'income' | 'expense') => {
    setActiveSection(section);
    if (section === 'history' && filter) {
      setHistoryFilter(filter);
    } else {
      setHistoryFilter('all');
    }
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Fechar sidebar ao clicar fora (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        const menuButton = document.getElementById('menu-button');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Prevenir scroll do body quando sidebar está aberta no mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  const navigationItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, color: 'text-blue-600' },
    { id: 'accounts', label: 'Minhas Contas', icon: Wallet, color: 'text-green-600' },
    { id: 'cards', label: 'Meus Cartões', icon: CreditCard, color: 'text-purple-600' },
    { id: 'history', label: 'Histórico', icon: History, color: 'text-indigo-600' },
    { id: 'goals', label: 'Metas', icon: Target, color: 'text-emerald-600' },
    { id: 'limits', label: 'Limites', icon: Shield, color: 'text-orange-600' },
    { id: 'categories', label: 'Categorias', icon: BarChart3, color: 'text-pink-600' },
    { id: 'profile', label: 'Perfil', icon: UserIcon, color: 'text-gray-600' }
  ];

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    setHistoryFilter('all');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <FinancialOverview
            accounts={accounts}
            cards={cards}
            transactions={transactions}
            goals={goals}
            limits={limits}
            summary={summary}
            onNavigateToAccounts={() => handleNavigationWithFilter('accounts')}
            onNavigateToHistory={(filter) => handleNavigationWithFilter('history', filter)}
          />
        );
      case 'accounts':
        return (
          <AccountsManager
            accounts={accounts}
            onAddAccount={addAccount}
            onUpdateAccount={updateAccount}
          />
        );
      case 'cards':
        return (
          <CardsManager
            cards={cards}
            onAddCard={addCard}
            onUpdateCard={updateCard}
          />
        );
      case 'history':
        return (
          <TransactionsHistory
            transactions={transactions}
            accounts={accounts}
            cards={cards}
            onUpdateTransaction={updateTransaction}
            customCategories={customCategories}
            onAddCustomCategory={addCustomCategory}
            onAddCustomSubcategory={addCustomSubcategory}
            initialFilter={historyFilter}
          />
        );
      case 'goals':
        return (
          <GoalsManager
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
          />
        );
      case 'limits':
        return (
          <LimitsManager
            limits={limits}
            onAddLimit={addLimit}
            onUpdateLimit={updateLimit}
          />
        );
      case 'categories':
        return (
          <CategoriesManager
            customCategories={customCategories}
            onAddCustomCategory={addCustomCategory}
            onAddCustomSubcategory={addCustomSubcategory}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            onResetAllData={resetAllData}
            accounts={accounts}
            cards={cards}
            transactions={transactions}
            goals={goals}
            limits={limits}
            summary={summary}
          />
        );
      default:
        return null;
    }
  };

  const getCurrentSectionInfo = () => {
    const section = navigationItems.find(item => item.id === activeSection);
    return section || navigationItems[0];
  };

  const currentSection = getCurrentSectionInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Layout Desktop */}
      <div className="hidden lg:flex h-screen">
        {/* Sidebar Desktop */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestor Pro</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Finanças Pessoais</p>
              </div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id as ActiveSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isActive 
                        ? 'text-white' 
                        : item.color
                    }`} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        {/* Conteúdo Principal Desktop */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Desktop */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${
                  activeSection === 'overview' ? 'from-blue-500 to-purple-500' :
                  activeSection === 'accounts' ? 'from-green-500 to-emerald-500' :
                  activeSection === 'cards' ? 'from-purple-500 to-pink-500' :
                  activeSection === 'history' ? 'from-indigo-500 to-blue-500' :
                  activeSection === 'goals' ? 'from-emerald-500 to-teal-500' :
                  activeSection === 'limits' ? 'from-orange-500 to-red-500' :
                  activeSection === 'categories' ? 'from-pink-500 to-rose-500' :
                  'from-gray-500 to-gray-600'
                }`}>
                  <currentSection.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentSection.label}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeSection === 'overview' && 'Visão geral das suas finanças'}
                    {activeSection === 'accounts' && 'Gerencie suas contas bancárias'}
                    {activeSection === 'cards' && 'Controle seus cartões de crédito'}
                    {activeSection === 'history' && 'Histórico de todas as transações'}
                    {activeSection === 'goals' && 'Acompanhe seus objetivos financeiros'}
                    {activeSection === 'limits' && 'Controle seus gastos mensais'}
                    {activeSection === 'categories' && 'Organize suas categorias'}
                    {activeSection === 'profile' && 'Configurações da conta'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <QuickOptionsMenu onNavigate={handleSectionChange} />
                <button
                  onClick={() => setShowNewTransactionModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  Novo Lançamento
                </button>
              </div>
            </div>
          </header>

          {/* Conteúdo Principal Desktop */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderActiveSection()}
          </main>
        </div>
      </div>

      {/* Layout Mobile */}
      <div className="lg:hidden">
        {/* Header Mobile */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                id="menu-button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
              >
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${
                  activeSection === 'overview' ? 'from-blue-500 to-purple-500' :
                  activeSection === 'accounts' ? 'from-green-500 to-emerald-500' :
                  activeSection === 'cards' ? 'from-purple-500 to-pink-500' :
                  activeSection === 'history' ? 'from-indigo-500 to-blue-500' :
                  activeSection === 'goals' ? 'from-emerald-500 to-teal-500' :
                  activeSection === 'limits' ? 'from-orange-500 to-red-500' :
                  activeSection === 'categories' ? 'from-pink-500 to-rose-500' :
                  'from-gray-500 to-gray-600'
                }`}>
                  <currentSection.icon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentSection.label}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target">
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target">
                <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </header>

        {/* Sidebar Mobile (Overlay) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
            
            {/* Sidebar */}
            <aside
              id="mobile-sidebar"
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-out"
            >
              {/* Header da Sidebar */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Home className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Gestor Pro</h1>
                      <p className="text-sm text-white text-opacity-90">Finanças Pessoais</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors touch-target"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Navegação */}
              <nav className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id as ActiveSection)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 touch-target ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-white bg-opacity-20' 
                          : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          isActive 
                            ? 'text-white' 
                            : item.color
                        }`} />
                      </div>
                      <span className="font-semibold text-lg">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Footer da Sidebar */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.user_metadata?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors touch-target"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold">Sair da Conta</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Conteúdo Principal Mobile */}
        <main className="pb-20 px-4 py-6 space-y-6">
          {renderActiveSection()}
        </main>

        {/* Bottom Navigation Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-30">
          <div className="flex justify-around items-center">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id as ActiveSection)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 touch-target ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 scale-110'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 active:scale-95'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                  <span className="text-xs font-medium truncate max-w-[60px]">
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Floating Action Button Mobile */}
        <button
          onClick={() => setShowNewTransactionModal(true)}
          className="fixed bottom-32 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 active:scale-95 transition-all duration-300 z-40 touch-target"
          aria-label="Novo Lançamento"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Modais e Componentes Globais */}
      <NewTransactionModal
        isOpen={showNewTransactionModal}
        onClose={() => setShowNewTransactionModal(false)}
        onAddTransaction={addTransaction}
        accounts={accounts}
        cards={cards}
        customCategories={customCategories}
        onAddCustomCategory={addCustomCategory}
        onAddCustomSubcategory={addCustomSubcategory}
      />

      <AIChat
        onAddTransaction={addTransaction}
        onAddCustomSubcategory={addCustomSubcategory}
        onAddAccount={addAccount}
        onAddCard={addCard}
        onAddGoal={addGoal}
        onAddLimit={addLimit}
        onResetAllData={resetAllData}
        customCategories={customCategories}
        accounts={accounts}
        cards={cards}
      />
    </div>
  );
};