import { X, Heart, Loader2 } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import axiosInstance from "../../axios"

const Wishlist = ({ isOpen, onClose, wishlistItems = [], loading = false, onRefresh }) => {
  const { userInfo } = useSelector((state) => state.auth)

  const handleRemoveFromWishlist = async (productId) => {
    try {
      // Remove Authorization header since we're using cookies
      const { data } = await axiosInstance.delete(`/wishlist/remove/${productId}`)

      if (data.success) {
        toast.success(data.message)
        onRefresh() // Refresh the wishlist data
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      const message = error.response?.data?.message || "Failed to remove item from wishlist"
      toast.error(message)
    }
  }

  const getProductImageUrl = (item) => {
    if (item.image) {
      // If image is a full URL, return as is
      if (item.image.startsWith("http")) {
        return item.image
      }
      // If image is a relative path, prepend base URL
      return `/uploads/${item.image}`
    }
    return "/api/placeholder/64/64"
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-myprimary text-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Wishlist Items</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading wishlist...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Heart className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Your wishlist is empty</p>
              <p className="text-sm text-center mt-2">Add items you love to your wishlist and they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getProductImageUrl(item) || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/64/64"
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-lg font-semibold text-blue-600 mt-1">{formatPrice(item.price)}</p>

                    {/* Subcategory */}
                    {item.subCategory && <p className="text-xs text-gray-500 mt-1">{item.subCategory}</p>}

                    {/* Variants info */}
                    {item.variants && item.variants.length > 1 && (
                      <p className="text-xs text-gray-500 mt-1">{item.variants.length} variants available</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    title="Remove from wishlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && wishlistItems.length > 0 && (
          <div className="border-t p-4 mb-6 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} in wishlist
            </div>
            <div className="space-y-2">
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  //  clear wishlist functionality if needed
                  onRefresh()
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Refresh Wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Wishlist
