import React, { useState } from 'react';
import { Tag, Plus, Edit3, Trash2, ChevronRight, ChevronDown, Palette, Search, Filter, X } from 'lucide-react';
import { defaultCategories, availableIcons, Category, SubCategory } from '../data/categories';

interface CategoriesManagerProps {
  customCategories: Category[];
  onAddCustomCategory: (category: Omit<Category, 'id'>) => void;
  onAddCustomSubcategory: (categoryId: string, subcategory: Omit<SubCategory, 'id'>) => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  customCategories,
  onAddCustomCategory,
  onAddCustomSubcategory
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'both'>('all');
  
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    icon: 'DollarSign',
    type: 'expense' as 'income' | 'expense' | 'both'
  });
  
  const [newSubcategoryForm, setNewSubcategoryForm] = useState({
    name: '',
    icon: 'DollarSign'
  });

  const allCategories = [...defaultCategories, ...customCategories];
  
  const filteredCategories = allCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || category.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (newCategoryForm.name && onAddCustomCategory) {
      const selectedIcon = availableIcons.find(icon => icon.name === newCategoryForm.icon);
      onAddCustomCategory({
        name: newCategoryForm.name,
        icon: selectedIcon?.icon || availableIcons[0].icon,
        type: newCategoryForm.type,
        subcategories: []
      });
      setNewCategoryForm({ name: '', icon: 'DollarSign', type: 'expense' });
      setShowAddCategoryModal(false);
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategoryForm.name && selectedCategoryForSub && onAddCustomSubcategory) {
      const selectedIcon = availableIcons.find(icon => icon.name === newSubcategoryForm.icon);
      onAddCustomSubcategory(selectedCategoryForSub, {
        name: newSubcategoryForm.name,
        icon: selectedIcon?.icon || availableIcons[0].icon
      });
      setNewSubcategoryForm({ name: '', icon: 'DollarSign' });
      setShowAddSubcategoryModal(false);
      setSelectedCategoryForSub('');
    }
  };

  const getTypeColor = (type: Category['type']) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      case 'both': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: Category['type']) => {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      case 'both': return 'Ambos';
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
              <Tag className="h-8 w-8 text-white" />
            </div>
            Minhas Categorias
          </h2>
          <p className="text-gray-600 mt-2">Gerencie suas categorias e subcategorias personalizadas</p>
        </div>
        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          Nova Categoria
        </button>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar categorias e subcategorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
              <option value="both">Ambos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCategories.has(category.id);
          const isCustom = customCategories.some(c => c.id === category.id);

          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
              {/* Header da Categoria */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                      <CategoryIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(category.type)}`}>
                          {getTypeText(category.type)}
                        </span>
                        {isCustom && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            Personalizada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategoryForSub(category.id);
                        setShowAddSubcategoryModal(true);
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Adicionar subcategoria"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    {category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subcategorias */}
              {isExpanded && category.subcategories.length > 0 && (
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Subcategorias ({category.subcategories.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.subcategories.map((subcategory) => {
                      const SubcategoryIcon = subcategory.icon;
                      return (
                        <div
                          key={subcategory.id}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 transform hover:scale-105"
                        >
                          <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-2 rounded-lg">
                            <SubcategoryIcon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-800">{subcategory.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mensagem quando não há subcategorias */}
              {isExpanded && category.subcategories.length === 0 && (
                <div className="p-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <Tag className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">Nenhuma subcategoria ainda</p>
                  <button
                    onClick={() => {
                      setSelectedCategoryForSub(category.id);
                      setShowAddSubcategoryModal(true);
                    }}
                    className="mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Adicionar primeira subcategoria
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado vazio */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' 
              ? 'Nenhuma categoria encontrada' 
              : 'Nenhuma categoria personalizada'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'Tente ajustar os filtros de pesquisa'
              : 'Crie suas próprias categorias personalizadas'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Criar Primeira Categoria
            </button>
          )}
        </div>
      )}

      {/* Modal Adicionar Categoria */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Nova Categoria</h3>
                    <p className="text-white text-opacity-90">Crie uma categoria personalizada</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={newCategoryForm.name}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Ex: Minha Categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'expense', label: 'Despesa', color: 'from-red-500 to-red-600' },
                    { value: 'income', label: 'Receita', color: 'from-green-500 to-green-600' },
                    { value: 'both', label: 'Ambos', color: 'from-blue-500 to-blue-600' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewCategoryForm({ ...newCategoryForm, type: type.value as any })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        newCategoryForm.type === type.value
                          ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg scale-105`
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="font-semibold">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ícone *
                </label>
                <div className="grid grid-cols-8 gap-3 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                  {availableIcons.map((icon) => {
                    const IconComponent = icon.icon;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setNewCategoryForm({ ...newCategoryForm, icon: icon.name })}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-110 ${
                          newCategoryForm.icon === icon.name
                            ? 'border-purple-500 bg-purple-50 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Criar Categoria
                </button>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Subcategoria */}
      {showAddSubcategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <Tag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Nova Subcategoria</h3>
                    <p className="text-white text-opacity-90">Adicione uma subcategoria</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSubcategoryModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Subcategoria *
                </label>
                <input
                  type="text"
                  value={newSubcategoryForm.name}
                  onChange={(e) => setNewSubcategoryForm({ ...newSubcategoryForm, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Ex: Minha Subcategoria"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ícone *
                </label>
                <div className="grid grid-cols-8 gap-3 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                  {availableIcons.map((icon) => {
                    const IconComponent = icon.icon;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setNewSubcategoryForm({ ...newSubcategoryForm, icon: icon.name })}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-110 ${
                          newSubcategoryForm.icon === icon.name
                            ? 'border-green-500 bg-green-50 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleAddSubcategory}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Criar Subcategoria
                </button>
                <button
                  onClick={() => setShowAddSubcategoryModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};