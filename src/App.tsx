
// FICHEIRO: src/App.tsx
// Versão com o fluxo de cadastro corrigido e melhorado.

import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { 
    LayoutDashboard, 
    Wallet, 
    CreditCard, 
    History, 
    Target, 
    ShieldAlert, 
    User as UserIcon,
    Menu,
    X,
    Plus,
    LogOut,
    ChevronDown,
    BarChart2,
    TrendingUp,
    PieChart,
    MessageSquare,
    LoaderCircle
} from 'lucide-react';

// --- Configuração da Supabase ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("As variáveis de ambiente da Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não estão definidas no ficheiro .env. A aplicação pode não funcionar corretamente.");
}
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Contexto da Aplicação ---
const AppContext = createContext<{
    user: User | null;
    loading: boolean;
    signIn: (email, password) => Promise<any>;
    signUp: (email, password) => Promise<any>;
    signOut: () => Promise<any>;
} | null>(null);

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const value = { user, loading, signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }), signUp: (email, password) => supabase.auth.signUp({ email, password }), signOut: () => supabase.auth.signOut() };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAuth must be used within an AppProvider');
    return context;
};

// --- Componente Principal ---
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>;
  }
  
  useEffect(() => {
    document.body.className = 'bg-gray-100 dark:bg-gray-950';
  }, []);

  return <div className="min-h-screen">{user ? <Dashboard /> : <AuthForm />}</div>;
}

// --- Componente de Autenticação (COM CORREÇÃO) ---
export const AuthForm = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Estado para mensagens de sucesso
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage(''); // Limpa mensagens anteriores

        try {
            if (isLogin) {
                // Lógica de Login
                const { error } = await signIn(email, password);
                if (error) setError(error.message);
            } else {
                // Lógica de Cadastro (SignUp)
                const { data, error } = await signUp(email, password);
                if (error) {
                    setError(error.message);
                } else if (data.user && data.user.identities && data.user.identities.length === 0) {
                    // Caso o utilizador já exista mas não tenha confirmado o email
                    setError('Este email já está registado mas não foi confirmado.');
                    setMessage('Por favor, verifique a sua caixa de entrada para o link de confirmação.');
                }
                else {
                    // Cadastro bem-sucedido, mostra mensagem para verificar o email
                    setMessage('Cadastro realizado com sucesso! Por favor, verifique o seu e-mail para confirmar a sua conta antes de fazer login.');
                }
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-950">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">{isLogin ? 'Bem-vindo de Volta' : 'Crie a sua Conta'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" disabled={loading} className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                        {loading ? <LoaderCircle className="animate-spin mx-auto" /> : (isLogin ? 'Entrar' : 'Registar')}
                    </button>
                    {/* Mostra mensagens de erro ou sucesso */}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                </form>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-semibold text-blue-600 hover:underline">
                        {isLogin ? 'Registe-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- Componentes do Dashboard Responsivo ---

const Sidebar = ({ isOpen, setIsOpen, activeView, setActiveView }) => {
    const { signOut, user } = useAuth();
    const navItems = [
        { icon: LayoutDashboard, label: 'Visão Geral' },
        { icon: Wallet, label: 'Minhas Contas' },
        { icon: CreditCard, label: 'Meus Cartões' },
        { icon: History, label: 'Histórico' },
        { icon: Target, label: 'Metas' },
        { icon: ShieldAlert, label: 'Limites' },
        { icon: UserIcon, label: 'Perfil' },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 bg-gray-800 text-white shadow-lg z-30 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:flex-shrink-0`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold">Gestor Pro</h1>
                <button onClick={() => setIsOpen(false)} className="lg:hidden"><X /></button>
            </div>
            
            <nav className="flex-1 overflow-y-auto">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <a href="#" onClick={() => { setActiveView(item.label); setIsOpen(false); }} className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 ${activeView === item.label ? 'bg-gray-700 border-r-4 border-blue-500 text-white' : ''}`}>
                                <item.icon className="w-5 h-5" />
                                <span className="ml-4 font-semibold">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-400"/>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-200 truncate">{user?.email}</p>
                        <button onClick={signOut} className="text-xs text-red-400 hover:underline">Sair</button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const Header = ({ onMenuClick, activeView }) => {
    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden text-gray-600 dark:text-gray-300">
                    <Menu size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeView}</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-700 rounded-lg">
                    Acesso Rápido <ChevronDown size={16} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    <Plus size={16} /> Novo Lançamento
                </button>
            </div>
        </header>
    );
};

// --- Componentes de Conteúdo para cada Vista ---
const VisaoGeral = ({ setActiveView, setHistoryFilter }) => (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <button onClick={() => setActiveView('Minhas Contas')} className="text-left bg-blue-500 text-white p-5 rounded-xl shadow-lg hover:bg-blue-600 transition-colors"><h3 className="font-semibold">Saldo Total</h3><p className="text-3xl font-bold mt-2">R$ 0,00</p></button>
            <button onClick={() => { setHistoryFilter('income'); setActiveView('Histórico'); }} className="text-left bg-green-500 text-white p-5 rounded-xl shadow-lg hover:bg-green-600 transition-colors"><h3 className="font-semibold">Receitas (Mês)</h3><p className="text-3xl font-bold mt-2">R$ 0,00</p></button>
            <button onClick={() => { setHistoryFilter('expense'); setActiveView('Histórico'); }} className="text-left bg-red-500 text-white p-5 rounded-xl shadow-lg hover:bg-red-600 transition-colors"><h3 className="font-semibold">Despesas (Mês)</h3><p className="text-3xl font-bold mt-2">R$ 0,00</p></button>
            <div className="bg-purple-500 text-white p-5 rounded-xl shadow-lg"><h3 className="font-semibold">Total Recebido</h3><p className="text-3xl font-bold mt-2">R$ 0,00</p></div>
            <div className="bg-orange-500 text-white p-5 rounded-xl shadow-lg"><h3 className="font-semibold">Total Pago</h3><p className="text-3xl font-bold mt-2">R$ 0,00</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white"><BarChart2 /> Fluxo de Caixa</h3></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white"><TrendingUp /> Evolução do Saldo</h3></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white"><PieChart /> Despesas por Categoria</h3></div>
        </div>
    </div>
);

// Componentes Placeholder para as outras vistas
const MinhasContas = () => <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Contas</h2></div>;
const MeusCartoes = () => <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Cartões</h2></div>;
const Historico = ({ filter }) => <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Transações</h2><p className="text-gray-600 dark:text-gray-400">A mostrar: {filter === 'all' ? 'Todas' : (filter === 'income' ? 'Receitas' : 'Despesas')}</p></div>;
const Metas = () => <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Metas</h2></div>;
const Limites = () => <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Limites</h2></div>;
const Perfil = () => <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil</h2></div>;


const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState('Visão Geral');
    const [historyFilter, setHistoryFilter] = useState('all');

    const renderContent = () => {
        switch (activeView) {
            case 'Minhas Contas': return <MinhasContas />;
            case 'Meus Cartões': return <MeusCartoes />;
            case 'Histórico': return <Historico filter={historyFilter} />;
            case 'Metas': return <Metas />;
            case 'Limites': return <Limites />;
            case 'Perfil': return <Perfil />;
            case 'Visão Geral':
            default:
                return <VisaoGeral setActiveView={setActiveView} setHistoryFilter={setHistoryFilter} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsOpen} activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} activeView={activeView} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    {renderContent()}
                </main>
            </div>
            <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-20">
                <MessageSquare size={24} />
            </button>
        </div>
    );
};

export default App;
