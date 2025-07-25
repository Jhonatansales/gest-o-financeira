import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit3 } from 'lucide-react';
import { defaultCategories, availableIcons, Category, SubCategory } from '../data/categories';

interface CategorySelectorProps {
  selectedCategory: string;
  selectedSubcategory?: string;
  onCategoryChange: (category: string, subcategory?: string) => void;
  transactionType: 'income' | 'expense' | 'transfer';
  customCategories?: Category[];
  onAddCustomCategory?: (category: Omit<Category, 'id'>) => void;
  onAddCustomSubcategory?: (categoryId: string, subcategory: Omit<SubCategory, 'id'>) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  transactionType,
  customCategories = [],
  onAddCustomCategory,
  onAddCustomSubcategory
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');
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
  const filteredCategories = allCategories.filter(cat => 
    cat.type === transactionType || cat.type === 'both'
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    if (!expandedCategories.has(categoryId)) {
      toggleCategory(categoryId);
    }
  };

  const handleSubcategorySelect = (categoryId: string, subcategoryId: string) => {
    onCategoryChange(categoryId, subcategoryId);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Categoria *
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddCategoryModal(true)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Nova Categoria
          </button>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCategories.has(category.id);
          const isCategorySelected = selectedCategory === category.id;

          return (
            <div key={category.id} className="border-b border-gray-100 last:border-b-0">
              <div
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isCategorySelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <CategoryIcon className="h-5 w-5 text-gray-600" />
                  <span className={`font-medium ${isCategorySelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategoryForSub(category.id);
                      setShowAddSubcategoryModal(true);
                    }}
                    className="text-gray-400 hover:text-blue-600 p-1"
                    title="Adicionar subcategoria"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  {category.subcategories.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
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

              {isExpanded && category.subcategories.length > 0 && (
                <div className="bg-gray-50">
                  {category.subcategories.map((subcategory) => {
                    const SubcategoryIcon = subcategory.icon;
                    const isSubcategorySelected = selectedSubcategory === subcategory.id;

                    return (
                      <div
                        key={subcategory.id}
                        className={`flex items-center space-x-3 p-3 pl-12 cursor-pointer hover:bg-gray-100 transition-colors ${
                          isSubcategorySelected ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleSubcategorySelect(category.id, subcategory.id)}
                      >
                        <SubcategoryIcon className="h-4 w-4 text-gray-500" />
                        <span className={`text-sm ${isSubcategorySelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                          {subcategory.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Categoria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={newCategoryForm.name}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Minha Categoria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone
                  </label>
                  <select
                    value={newCategoryForm.icon}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableIcons.map((icon) => {
                      const IconComponent = icon.icon;
                      return (
                        <option key={icon.name} value={icon.name}>
                          {icon.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="mt-2 grid grid-cols-6 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {availableIcons.map((icon) => {
                      const IconComponent = icon.icon;
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setNewCategoryForm({ ...newCategoryForm, icon: icon.name })}
                          className={`p-2 rounded-lg border-2 transition-colors ${
                            newCategoryForm.icon === icon.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newCategoryForm.type}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showAddSubcategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Subcategoria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Subcategoria
                  </label>
                  <input
                    type="text"
                    value={newSubcategoryForm.name}
                    onChange={(e) => setNewSubcategoryForm({ ...newSubcategoryForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Minha Subcategoria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone
                  </label>
                  <select
                    value={newSubcategoryForm.icon}
                    onChange={(e) => setNewSubcategoryForm({ ...newSubcategoryForm, icon: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableIcons.map((icon) => (
                      <option key={icon.name} value={icon.name}>
                        {icon.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 grid grid-cols-6 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {availableIcons.map((icon) => {
                      const IconComponent = icon.icon;
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setNewSubcategoryForm({ ...newSubcategoryForm, icon: icon.name })}
                          className={`p-2 rounded-lg border-2 transition-colors ${
                            newSubcategoryForm.icon === icon.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddSubcategory}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowAddSubcategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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