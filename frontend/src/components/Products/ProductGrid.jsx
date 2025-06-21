// ProductGrid.jsx
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import WishlistButton from './WishlistButton';

const ProductGrid = ({
  loading,
  products,
  wishlistItems,
  wishlistLoading,
  setWishlistItems,
  setWishlistLoading,
  isAuthenticated
}) => {
  const getProductImageUrl = (product) => product.images?.[0] || null;

  const getProductPrice = (product) => {
    if (product.variants?.length) return product.variants[0].price || 0;
    return product.price || 0;
  };

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
  ));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#EDA415]" />
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No products found</div>
        <p className="text-gray-400 mt-2">Try adjusting your filters or add some products</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {products.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="cursor-pointer bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative p-6">
            <WishlistButton
              productId={product._id}
              wishlistItems={wishlistItems}
              wishlistLoading={wishlistLoading}
              setWishlistItems={setWishlistItems}
              setWishlistLoading={setWishlistLoading}
              isAuthenticated={isAuthenticated}
            />
            <div className="flex justify-center mb-4">
              {getProductImageUrl(product) && (
                <img
                  src={getProductImageUrl(product)}
                  alt={product.title || product.name}
                  className="w-32 h-24 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-[#003F62] font-medium mb-2">{product.title || product.name}</h3>
              <p className="text-xl font-semibold text-gray-900 mb-2">
                ${getProductPrice(product).toFixed(2)}
              </p>
              <div className="flex justify-center mb-2">{renderStars(product.rating || 0)}</div>
              <p className="text-xs text-gray-500">
                {product.subCategory?.name} • {product.subCategory?.category?.name}
              </p>
              {product.variants?.[0]?.ram && (
                <p className="text-xs text-gray-400 mt-1">RAM: {product.variants[0].ram}GB</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
