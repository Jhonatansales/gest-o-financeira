import React, { useState, useRef, useEffect } from 'react';
import { Settings, CreditCard, Wallet, Tag, Target, Shield, ChevronDown, TrendingUp, Building, Users, BarChart3 } from 'lucide-react';

interface QuickOptionsMenuProps {
  onNavigate: (section: string) => void;
}

export const QuickOptionsMenu: React.FC<QuickOptionsMenuProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options = [
    { 
      id: 'accounts', 
      label: 'Minhas Contas', 
      icon: Wallet,
      description: 'Gerencie suas contas bancárias',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'cards', 
      label: 'Meus Cartões', 
      icon: CreditCard,
      description: 'Controle seus cartões de crédito',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'goals', 
      label: 'Minhas Metas', 
      icon: Target,
      description: 'Acompanhe seus objetivos financeiros',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'limits', 
      label: 'Meus Limites', 
      icon: Shield,
      description: 'Controle seus gastos mensais',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'categories', 
      label: 'Categorias', 
      icon: Tag,
      description: 'Organize suas transações',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      id: 'history', 
      label: 'Histórico', 
      icon: BarChart3,
      description: 'Visualize suas transações',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const handleOptionClick = (optionId: string) => {
    onNavigate(optionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-gray-300"
      >
        <Settings className="h-5 w-5" />
        <span className="hidden sm:inline">Acesso Rápido</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 z-50 animate-scaleIn backdrop-blur-sm">
          <div className="px-4 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Acesso Rápido</h3>
            <p className="text-sm text-gray-600">Navegue rapidamente pelas seções</p>
          </div>
          
          <div className="py-2">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center gap-4 text-gray-700 hover:text-gray-900 transition-all duration-200 group"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${option.color} group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="px-4 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              💡 Use estes atalhos para navegar rapidamente
            </div>
          </div>
        </div>
      )}
    </div>
  );
};