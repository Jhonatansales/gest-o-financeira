import React from 'react';
import { useApp } from '../contexts/AppContext';

// Hook para detectar se é mobile
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
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

  return isMobile;
};

// Componente para aplicar estilos mobile-first
export const MobileContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'mobile-optimized' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Componente para botão de ação flutuante (FAB)
export const FloatingActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
}> = ({ onClick, icon, label, className = '' }) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-40 ${className}`}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

// Componente para navegação inferior (Bottom Navigation)
export const BottomNavigation: React.FC<{
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick: () => void;
  }>;
}> = ({ items }) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
      <div className="flex justify-around items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              item.active
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente para cards otimizados para mobile
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const isMobile = useIsMobile();
  
  const baseClasses = isMobile
    ? 'bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100'
    : 'bg-white rounded-2xl shadow-lg p-6 card-hover';
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
    >
      {children}
    </Component>
  );
};

// Componente para formulários otimizados para mobile
export const MobileForm: React.FC<{
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}> = ({ children, onSubmit, className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <form
      onSubmit={onSubmit}
      className={`${isMobile ? 'space-y-4' : 'space-y-6'} ${className}`}
    >
      {children}
    </form>
  );
};

// Componente para inputs otimizados para mobile
export const MobileInput: React.FC<{
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  required?: boolean;
}> = ({ type = 'text', placeholder, value, onChange, className = '', label, required }) => {
  const isMobile = useIsMobile();
  
  const inputClasses = isMobile
    ? 'w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
    : 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  
  return (
    <div className={className}>
      {label && (
        <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={inputClasses}
      />
    </div>
  );
};

// Componente para botões otimizados para mobile
export const MobileButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false
}) => {
  const isMobile = useIsMobile();
  
  const baseClasses = isMobile
    ? 'w-full py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300'
    : 'px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    secondary: 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
  };
  
  const sizeClasses = isMobile ? {
    sm: 'py-3 text-base',
    md: 'py-4 text-lg',
    lg: 'py-5 text-xl'
  } : {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};