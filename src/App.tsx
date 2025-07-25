import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { ResponsiveFinancialModule } from './components/ResponsiveFinancialModule';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AppProvider>
        <AuthForm />
      </AppProvider>
    );
  }

  return (
    <div className="h-full">
      <AppProvider>
        <ResponsiveFinancialModule />
      </AppProvider>
    </div>
  );
}

export default App;