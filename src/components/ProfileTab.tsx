import React, { useState } from 'react';
import { User, Settings, Moon, Sun, Globe, DollarSign, Shield, Trash2, RotateCcw, Download, Share2, Camera, Save, Palette, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../contexts/AppContext';
import { ShareModal } from './ShareModal';
import { Account, Card, Transaction, Goal, Limit } from '../types/financial';

interface ProfileTabProps {
  onResetAllData?: () => void;
  accounts?: Account[];
  cards?: Card[];
  transactions?: Transaction[];
  goals?: Goal[];
  limits?: Limit[];
  summary?: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalReceived: number;
    totalPaid: number;
  };
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ 
  onResetAllData,
  accounts = [],
  cards = [],
  transactions = [],
  goals = [],
  limits = [],
  summary = {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalReceived: 0,
    totalPaid: 0
  }
}) => {
  const { user, signOut, updateProfile, updatePassword } = useAuth();
  const { settings, updateSettings, t } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [tempSettings, setTempSettings] = useState(settings);
  const [showShareModal, setShowShareModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    avatarUrl: user?.user_metadata?.avatar_url || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Lista de avatares animados predefinidos
  const predefinedAvatars = [
    { id: 'avatar1', emoji: '👨‍💼', animation: 'animate-bounce' },
    { id: 'avatar2', emoji: '👩‍💼', animation: 'animate-pulse' },
    { id: 'avatar3', emoji: '🧑‍💻', animation: 'animate-bounce' },
    { id: 'avatar4', emoji: '👨‍🎓', animation: 'animate-pulse' },
    { id: 'avatar5', emoji: '👩‍🎓', animation: 'animate-bounce' },
    { id: 'avatar6', emoji: '🧑‍🚀', animation: 'animate-pulse' },
    { id: 'avatar7', emoji: '👨‍🎨', animation: 'animate-bounce' },
    { id: 'avatar8', emoji: '👩‍🎨', animation: 'animate-pulse' },
    { id: 'avatar9', emoji: '🧑‍⚕️', animation: 'animate-bounce' },
    { id: 'avatar10', emoji: '👨‍🍳', animation: 'animate-pulse' }
  ];

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const handleSaveSettings = () => {
    updateSettings(tempSettings);
    setMessage(t('settings.saved'));
    setTimeout(() => setMessage(''), 3000);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: profileData.fullName,
        avatar_url: profileData.avatarUrl
      });
      if (error) throw error;
      setMessage('Perfil atualizado com sucesso!');
    } catch (error: any) {
      setMessage('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await updatePassword(passwordData.newPassword);
      if (error) throw error;
      setMessage('Senha atualizada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage('Erro ao atualizar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfileData({ ...profileData, avatarUrl });
    setShowAvatarSelector(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileData({ ...profileData, avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const sections = [
    { id: 'profile', label: 'Editar Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'data', label: 'Dados', icon: Download },
  ];

  const currencies = [
    { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro (R$)' }
  ];

  const layouts = [
    { id: 'default', name: t('layout.default'), description: 'Layout padrão com cards grandes' },
    { id: 'compact', name: t('layout.compact'), description: 'Layout compacto com informações condensadas' },
    { id: 'modern', name: t('layout.modern'), description: 'Layout moderno com gradientes e animações' },
    { id: 'classic', name: t('layout.classic'), description: 'Layout clássico com design tradicional' },
    { id: 'minimal', name: t('layout.minimal'), description: 'Layout minimalista com foco no essencial' },
    { id: 'zen', name: t('layout.zen'), description: 'Design ultra-minimalista inspirado na estética japonesa' },
    { id: 'neon', name: t('layout.neon'), description: 'Modo escuro futurista com efeitos neon' },
    { id: 'retro', name: t('layout.retro'), description: 'Tema nostálgico dos anos 80/90 com pixel art' },
    { id: 'neomorphic', name: t('layout.neomorphic'), description: 'Interface tátil com elementos extrudidos' },
    { id: 'corporate', name: t('layout.corporate'), description: 'Design profissional para ambiente empresarial' }
  ];

  const languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.profile')}</h2>
        <button
          onClick={handleSignOut}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Sair
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    activeSection === section.id 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      activeSection === section.id 
                        ? 'text-white' 
                        : 'text-gray-600 group-hover:text-white'
                    }`} />
                  </div>
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Perfil</h3>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-gray-400 dark:text-gray-300" />
                    )}
                  </div>
                  <button 
                    onClick={() => setShowAvatarSelector(true)}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{user?.email}</h4>
                  <p className="text-gray-600 dark:text-gray-300">Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-PT')}</p>
                </div>
              </div>

              {/* Avatar Selector Modal */}
              {showAvatarSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Escolher Avatar</h3>
                        <button
                          onClick={() => setShowAvatarSelector(false)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Upload de arquivo */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ou faça upload da sua foto
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Escolher Arquivo
                          </label>
                        </div>
                      </div>

                      {/* Avatares animados predefinidos */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avatares Animados</h4>
                        <div className="grid grid-cols-5 gap-4">
                          {predefinedAvatars.map((avatar, index) => (
                            <button
                              key={index}
                              onClick={() => handleAvatarSelect(avatar.emoji)}
                              className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-all duration-300 transform hover:scale-110 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
                            >
                              <span className={`text-2xl ${avatar.animation}`}>
                                {avatar.emoji}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar Selecionado
                  </label>
                  <div className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2">
                    {profileData.avatarUrl && (
                      <span className="text-2xl">{profileData.avatarUrl}</span>
                    )}
                    <span className="text-sm text-gray-500">
                      {profileData.avatarUrl ? 'Avatar selecionado' : 'Nenhum avatar selecionado'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.title')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {tempSettings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{t('settings.darkMode')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Alternar entre tema claro e escuro</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, darkMode: !tempSettings.darkMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tempSettings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tempSettings.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="h-5 w-5" />
                    <h4 className="font-medium text-gray-900 dark:text-white">{t('settings.language')}</h4>
                  </div>
                  <select
                    value={tempSettings.language}
                    onChange={(e) => setTempSettings({ ...tempSettings, language: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-5 w-5" />
                    <h4 className="font-medium text-gray-900 dark:text-white">{t('settings.currency')}</h4>
                  </div>
                  <select
                    value={tempSettings.currency}
                    onChange={(e) => setTempSettings({ ...tempSettings, currency: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Palette className="h-5 w-5" />
                    <h4 className="font-medium text-gray-900 dark:text-white">{t('settings.layout')}</h4>
                  </div>
                  <div className="space-y-3">
                    {layouts.map((layout) => (
                      <div
                        key={layout.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          tempSettings.layout === layout.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => setTempSettings({ ...tempSettings, layout: layout.id })}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{layout.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{layout.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            tempSettings.layout === layout.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}>
                            {tempSettings.layout === layout.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {t('button.save')}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Segurança</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Zona de Perigo</h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      if (window.confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os seus dados financeiros (contas, cartões, transações, metas, limites). Esta ação é irreversível!\n\nTem certeza que deseja continuar?')) {
                        if (onResetAllData) {
                          onResetAllData();
                          setMessage('✅ Todos os dados foram resetados com sucesso!');
                        }
                      }
                    }}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Resetar Todos os Dados
                  </button>
                  <button 
                    onClick={() => {
                      alert('🚨 Funcionalidade em desenvolvimento.\n\nA exclusão permanente de conta ainda não está implementada.\n\n💡 Use o "Reset de Dados" para limpar todas as informações.');
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir Conta
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestão de Dados</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3">
                  <Download className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Exportar Dados</div>
                    <div className="text-sm opacity-90">Baixar planilha Excel</div>
                  </div>
                </button>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3"
                >
                  <Share2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Compartilhar</div>
                    <div className="text-sm opacity-90">Compartilhar progresso</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        accounts={accounts}
        cards={cards}
        transactions={transactions}
        goals={goals}
        limits={limits}
        summary={summary}
      />
    </div>
  );
};