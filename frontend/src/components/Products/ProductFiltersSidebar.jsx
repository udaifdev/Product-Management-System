// ProductFiltersSidebar.jsx
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const ProductFiltersSidebar = ({
  categories,
  subCategories,
  selectedFilters,
  setSelectedFilters,
  setCurrentPage
}) => {
  const [expandedCategories, setExpandedCategories] = useState({})

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const handleCategoryFilter = (categoryId) => {
    setSelectedFilters((prev) => ({
      category: prev.category === categoryId ? '' : categoryId,
      subCategory: '',
    }))
    setCurrentPage(1)
  }

  const handleSubCategoryFilter = (subCategoryId) => {
    setSelectedFilters((prev) => ({
      ...prev,
      subCategory: prev.subCategory === subCategoryId ? '' : subCategoryId,
    }))
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSelectedFilters({ category: '', subCategory: '' })
    setCurrentPage(1)
  }

  const getSubCategoriesForCategory = (categoryId) => {
    return subCategories.filter((subCat) => subCat.category._id === categoryId || subCat.category === categoryId)
  }

  return (
    <div className="lg:w-64 bg-white rounded-lg shadow-sm h-fit">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          {(selectedFilters.category || selectedFilters.subCategory) && (
            <button onClick={handleClearFilters} className="text-xs text-blue-600 hover:text-blue-800">
              Clear filters
            </button>
          )}
        </div>

        <div className="mb-2">
          <button
            onClick={handleClearFilters}
            className={`w-full text-left py-2 px-3 rounded-md transition-colors ${!selectedFilters.category && !selectedFilters.subCategory
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            All categories
          </button>
        </div>

        {categories.map((category) => (
          <div key={category._id} className="mb-2">
            <button
              onClick={() => toggleCategory(category._id)}
              className="w-full flex items-center justify-between py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <span>{category.name}</span>
              <ChevronDown
                className={`w-4 h-4 transform transition-transform ${expandedCategories[category._id] ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedCategories[category._id] && (
              <div className="ml-4 mt-1 space-y-1">
                <div className="flex items-center py-1">
                  <input
                    type="checkbox"
                    checked={selectedFilters.category === category._id}
                    onChange={() => handleCategoryFilter(category._id)}
                    className="w-4 h-4 text-blue-600 rounded mr-2"
                  />
                  <span className="text-sm text-gray-600">All {category.name}</span>
                </div>
                {getSubCategoriesForCategory(category._id).map((subCategory) => (
                  <div key={subCategory._id} className="flex items-center py-1 ml-4">
                    <input
                      type="checkbox"
                      checked={selectedFilters.subCategory === subCategory._id}
                      onChange={() => handleSubCategoryFilter(subCategory._id)}
                      className="w-4 h-4 text-blue-600 rounded mr-2"
                    />
                    <span className="text-sm text-gray-600">{subCategory.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductFiltersSidebar
