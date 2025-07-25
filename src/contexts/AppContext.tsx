import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  language: string;
  currency: string;
  layout: string;
  darkMode: boolean;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
}

const defaultSettings: AppSettings = {
  language: 'pt',
  currency: 'BRL', 
  layout: 'default',
  darkMode: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Traduções
const translations = {
  pt: {
    // Navigation
    'nav.overview': 'Visão Geral',
    'nav.accounts': 'Minhas Contas',
    'nav.cards': 'Meus Cartões',
    'nav.history': 'Histórico',
    'nav.profile': 'Perfil',
    
    // Overview
    'overview.totalBalance': 'Saldo Total',
    'overview.monthlyIncome': 'Receitas (Mês)',
    'overview.monthlyExpenses': 'Despesas (Mês)',
    'overview.totalReceived': 'Total Recebido',
    'overview.totalPaid': 'Total Pago',
    
    // Buttons
    'button.save': 'Salvar',
    'button.cancel': 'Cancelar',
    'button.add': 'Adicionar',
    'button.new': 'Novo',
    'button.launch': 'Lançar',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.language': 'Idioma',
    'settings.currency': 'Moeda',
    'settings.layout': 'Layout',
    'settings.darkMode': 'Modo Escuro',
    'settings.saved': 'Configurações salvas com sucesso!',
    
    // Layouts
    'layout.default': 'Padrão',
    'layout.compact': 'Compacto',
    'layout.modern': 'Moderno',
    'layout.classic': 'Clássico',
    'layout.minimal': 'Minimalista',
    'layout.zen': 'Foco Zen',
    'layout.neon': 'Neon Noir',
    'layout.retro': 'Analógico Clássico',
    'layout.neomorphic': 'Neumórfico Suave',
    'layout.corporate': 'Executivo Corporativo',
    
    // Categories
    'category.alimentacao': 'Alimentação',
    'category.padaria': 'Padaria',
    'category.outros': 'Outros'
  },
  en: {
    // Navigation
    'nav.overview': 'Overview',
    'nav.accounts': 'My Accounts',
    'nav.cards': 'My Cards',
    'nav.history': 'History',
    'nav.profile': 'Profile',
    
    // Overview
    'overview.totalBalance': 'Total Balance',
    'overview.monthlyIncome': 'Monthly Income',
    'overview.monthlyExpenses': 'Monthly Expenses',
    'overview.totalReceived': 'Total Received',
    'overview.totalPaid': 'Total Paid',
    
    // Buttons
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.add': 'Add',
    'button.new': 'New',
    'button.launch': 'Launch',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.layout': 'Layout',
    'settings.darkMode': 'Dark Mode',
    'settings.saved': 'Settings saved successfully!',
    
    // Layouts
    'layout.default': 'Default',
    'layout.compact': 'Compact',
    'layout.modern': 'Modern',
    'layout.classic': 'Classic',
    'layout.minimal': 'Minimal',
    'layout.zen': 'Zen Focus',
    'layout.neon': 'Neon Noir',
    'layout.retro': 'Retro Classic',
    'layout.neomorphic': 'Soft Neomorphic',
    'layout.corporate': 'Corporate Executive',
    
    // Categories
    'category.alimentacao': 'Food',
    'category.padaria': 'Bakery',
    'category.outros': 'Others'
  },
  es: {
    // Navigation
    'nav.overview': 'Resumen',
    'nav.accounts': 'Mis Cuentas',
    'nav.cards': 'Mis Tarjetas',
    'nav.history': 'Historial',
    'nav.profile': 'Perfil',
    
    // Overview
    'overview.totalBalance': 'Saldo Total',
    'overview.monthlyIncome': 'Ingresos (Mes)',
    'overview.monthlyExpenses': 'Gastos (Mes)',
    'overview.totalReceived': 'Total Recibido',
    'overview.totalPaid': 'Total Pagado',
    
    // Buttons
    'button.save': 'Guardar',
    'button.cancel': 'Cancelar',
    'button.add': 'Añadir',
    'button.new': 'Nuevo',
    'button.launch': 'Lanzar',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.currency': 'Moneda',
    'settings.layout': 'Diseño',
    'settings.darkMode': 'Modo Oscuro',
    'settings.saved': '¡Configuración guardada con éxito!',
    
    // Layouts
    'layout.default': 'Por Defecto',
    'layout.compact': 'Compacto',
    'layout.modern': 'Moderno',
    'layout.classic': 'Clásico',
    'layout.minimal': 'Minimalista',
    'layout.zen': 'Enfoque Zen',
    'layout.neon': 'Neón Noir',
    'layout.retro': 'Clásico Analógico',
    'layout.neomorphic': 'Neumórfico Suave',
    'layout.corporate': 'Ejecutivo Corporativo',
    
    // Categories
    'category.alimentacao': 'Alimentación',
    'category.padaria': 'Panadería',
    'category.outros': 'Otros'
  },
  fr: {
    // Navigation
    'nav.overview': 'Aperçu',
    'nav.accounts': 'Mes Comptes',
    'nav.cards': 'Mes Cartes',
    'nav.history': 'Historique',
    'nav.profile': 'Profil',
    
    // Overview
    'overview.totalBalance': 'Solde Total',
    'overview.monthlyIncome': 'Revenus (Mois)',
    'overview.monthlyExpenses': 'Dépenses (Mois)',
    'overview.totalReceived': 'Total Reçu',
    'overview.totalPaid': 'Total Payé',
    
    // Buttons
    'button.save': 'Sauvegarder',
    'button.cancel': 'Annuler',
    'button.add': 'Ajouter',
    'button.new': 'Nouveau',
    'button.launch': 'Lancer',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.currency': 'Devise',
    'settings.layout': 'Mise en page',
    'settings.darkMode': 'Mode Sombre',
    'settings.saved': 'Paramètres sauvegardés avec succès!',
    
    // Layouts
    'layout.default': 'Par Défaut',
    'layout.compact': 'Compact',
    'layout.modern': 'Moderne',
    'layout.classic': 'Classique',
    'layout.minimal': 'Minimaliste',
    'layout.zen': 'Focus Zen',
    'layout.neon': 'Néon Noir',
    'layout.retro': 'Classique Analogique',
    'layout.neomorphic': 'Néomorphique Doux',
    'layout.corporate': 'Exécutif Corporatif',
    
    // Categories
    'category.alimentacao': 'Alimentation',
    'category.padaria': 'Boulangerie',
    'category.outros': 'Autres'
  }
};

const currencyConfig = {
  BRL: { symbol: 'R$', locale: 'pt-BR' },
  EUR: { symbol: '€', locale: 'pt-PT' },
  USD: { symbol: '$', locale: 'en-US' }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Apply dark mode to document root
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const t = (key: string): string => {
    const langTranslations = translations[settings.language as keyof typeof translations] || translations.pt;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  const formatCurrency = (amount: number): string => {
    // Sempre usar Real brasileiro
    const config = currencyConfig.BRL;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings, t, formatCurrency }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};