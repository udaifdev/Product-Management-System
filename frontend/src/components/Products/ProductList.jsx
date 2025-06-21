import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ChevronRight, X } from "lucide-react"
import { toast } from "react-toastify"
import axiosInstance from "../../axios"

import AddProduct from "./AddProduct"
import AddCategory from "./AddCategory"
import AddSubCategory from "./AddSubCategory"
import ProductFiltersSidebar from "./ProductFiltersSidebar"
import ProductGrid from "./ProductGrid"
import ProductPagination from "./ProductPagination"

const ProductList = ({ searchQuery }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState({})

  const [selectedFilters, setSelectedFilters] = useState({ category: "", subCategory: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [totalProducts, setTotalProducts] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false)

  const { userInfo, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const fetchWishlist = async () => {
    if (!isAuthenticated || !userInfo) return
    try {
      const { data } = await axiosInstance.get("/wishlist/get-all-wishlist")
      if (data.success) setWishlistItems(data.wishlist.map((item) => item._id))
    } catch (err) {
      console.error("Error fetching wishlist:", err)
    }
  }

  const fetchCategoriesAndSubCategories = async () => {
    try {
      const catRes = await axiosInstance.get("/product/getCategories")
      const subCatRes = await axiosInstance.get("/product/get-sub-Categories")
      setCategories(catRes.data.categories || catRes.data)
      setSubCategories(subCatRes.data.subCategories || subCatRes.data)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load categories")
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        category: selectedFilters.category,
        subCategory: selectedFilters.subCategory,
      })

      // Add search query if it exists
      if (searchQuery && searchQuery.trim()) {
        params.append("search", searchQuery.trim())
      }

      const { data } = await axiosInstance.get(`/product/get-all-product?${params}`)
      setProducts(data.products)
      setTotalProducts(data.total)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoriesAndSubCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedFilters, currentPage, itemsPerPage, searchQuery])

  useEffect(() => {
    fetchWishlist()
  }, [isAuthenticated, userInfo])

  // Reset to first page when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setCurrentPage(1)
    }
  }, [searchQuery])

  const handleAddProductClick = () => {
    if (!isAuthenticated) return toast.error("Please sign in!") || navigate("/auth")
    setIsAddProductModalOpen(true)
  }

  const handleAddCategoryClick = () => {
    if (!isAuthenticated) return toast.error("Please sign in!") || navigate("/auth")
    setIsAddCategoryModalOpen(true)
  }

  const handleAddSubCategoryClick = () => {
    if (!isAuthenticated) return toast.error("Please sign in!") || navigate("/auth")
    setIsAddSubCategoryModalOpen(true)
  }

  const clearFilters = () => {
    setSelectedFilters({ category: "", subCategory: "" })
    setCurrentPage(1)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null)
              fetchCategoriesAndSubCategories()
              fetchProducts()
            }}
            className="bg-[#EDA415] hover:bg-orange-300 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white mb-12">
      <div className="bg-white px-5 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center text-sm text-gray-900">
            <span>Home</span>
            <ChevronRight className="w-5 h-5 mx-2" />
            <span>Products</span>
            {searchQuery && (
              <>
                <ChevronRight className="w-5 h-5 mx-2" />
                <span className="text-[#EDA415]">Search: "{searchQuery}"</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-6">
            <button
              onClick={handleAddCategoryClick}
              className="bg-[#EDA415] text-white px-4 py-3 rounded-lg text-sm hover:bg-orange-300 transition-colors"
            >
              Add category
            </button>
            <button
              onClick={handleAddSubCategoryClick}
              className="bg-[#EDA415] text-white px-4 py-3 rounded-lg text-sm hover:bg-orange-300 transition-colors"
            >
              Add sub category
            </button>
            <button
              onClick={handleAddProductClick}
              className="bg-[#EDA415] text-white px-4 py-3 rounded-lg text-sm hover:bg-orange-300 transition-colors"
            >
              Add product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-4">
        <ProductFiltersSidebar
          categories={categories}
          subCategories={subCategories}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          setCurrentPage={setCurrentPage}
        />

        <div className="flex-1">
          {/* Active Filters Display */}
          {(searchQuery || selectedFilters.category || selectedFilters.subCategory) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EDA415] text-white text-sm rounded-full">
                    Search: "{searchQuery}"
                  </span>
                )}

                {selectedFilters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Category: {categories.find((cat) => cat._id === selectedFilters.category)?.name}
                    <button
                      onClick={() => setSelectedFilters((prev) => ({ ...prev, category: "" }))}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}

                {selectedFilters.subCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Sub-category: {subCategories.find((sub) => sub._id === selectedFilters.subCategory)?.name}
                    <button
                      onClick={() => setSelectedFilters((prev) => ({ ...prev, subCategory: "" }))}
                      className="ml-1 hover:text-green-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}

                {(selectedFilters.category || selectedFilters.subCategory) && (
                  <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline ml-2">
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            {loading ? (
              <span>Loading products...</span>
            ) : (
              <span>
                Showing {products.length} of {totalProducts} products
                {searchQuery && ` for "${searchQuery}"`}
              </span>
            )}
          </div>

          <ProductGrid
            loading={loading}
            products={products}
            wishlistItems={wishlistItems}
            wishlistLoading={wishlistLoading}
            setWishlistItems={setWishlistItems}
            setWishlistLoading={setWishlistLoading}
            isAuthenticated={isAuthenticated}
          />

          <ProductPagination
            totalProducts={totalProducts}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>
      </div>

      <AddCategory
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onCategoryAdded={fetchCategoriesAndSubCategories}
      />
      <AddProduct
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={fetchProducts}
      />
      <AddSubCategory
        isOpen={isAddSubCategoryModalOpen}
        onClose={() => setIsAddSubCategoryModalOpen(false)}
        onSubCategoryAdded={fetchCategoriesAndSubCategories}
      />
    </div>
  )
}

export default ProductList
