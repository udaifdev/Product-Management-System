"use client"

import { useState, useEffect } from "react"
import { Heart, ShoppingCart, LogOut, User, UserPlus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { logoutUser } from "../../slice/authSlice.js"
import Wishlist from "../Wishlist/Wishlist.jsx"
import axiosInstance from "../../axios.js"

const Header = ({ onSearch, searchQuery }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [wishlistItems, setWishlistItems] = useState([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "")

  const { userInfo, isAuthenticated } = useSelector((state) => state.auth)

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery || "")
  }, [searchQuery])

  // Fetch wishlist data from backend
  const fetchWishlist = async () => {
    if (!isAuthenticated || !userInfo) return
    try {
      setLoading(true)
      const { data } = await axiosInstance.get("/wishlist/get-all-wishlist")
      if (data.success) {
        setWishlistItems(data.wishlist)
        setWishlistCount(data.wishlistCount)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && userInfo) {
      fetchWishlist()
    } else {
      setWishlistItems([])
      setWishlistCount(0)
    }
  }, [isAuthenticated, userInfo])

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap()
      toast.success(result.message)
      setWishlistItems([])
      setWishlistCount(0)
      navigate("/auth")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const handleAuthClick = () => {
    navigate("/auth")
  }

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to view your wishlist")
      navigate("/auth")
      return
    }
    setIsWishlistOpen(true)
  }

  const handleCloseWishlist = () => {
    setIsWishlistOpen(false)
  }

  const refreshWishlist = () => {
    fetchWishlist()
  }

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearchQuery(value)

    // Clear existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout)
    }

    // Debounce search to avoid too many API calls
    if (onSearch) {
      window.searchTimeout = setTimeout(() => {
        onSearch(value)
      }, 300) // 300ms delay
    }
  }

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Clear any pending timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout)
    }
    // Immediately trigger search
    if (onSearch) {
      onSearch(localSearchQuery)
    }
  }

  return (
    <header className="bg-myprimary py-4">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo/Brand */}
        <div className="text-white text-xl font-bold">SECLOB STORE</div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md relative">
          <input
            type="text"
            placeholder="Search products by name..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="flex-1 px-4 py-2 rounded-l-full focus:outline-none focus:ring-2 "
          />

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-r-full flex items-center gap-2 transition-colors"
          >
            <Search size={16} />
            Search
          </button>
        </form>

        {/* Right Icons */}
        <div className="flex items-center gap-6 text-white text-sm">
          {/* Wishlist */}
          <button
            onClick={handleWishlistClick}
            className="relative p-2 text-gray-600 hover:text-red-500 transition-colors"
            title="Wishlist"
          >
            <Heart size={18} className="text-white" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EDA415] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <div className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition">
            <ShoppingCart size={18} className="text-white" />
            <span className="text-yellow-400">●</span>
            <span>Cart</span>
          </div>

          {/* Auth Section */}
          {isAuthenticated && userInfo ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <User size={18} className="text-white" />
                <span>{userInfo.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex text-xs items-center space-x-1 ml-3 hover:text-red-600 text-white px-2 py-1 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="flex text-xs items-center space-x-1 hover:text-green-600 text-white px-2 py-1 rounded-lg transition-colors duration-200"
            >
              <UserPlus className="w-3 h-3" />
              <span>Sign Up</span>
            </button>
          )}
        </div>
      </div>

      {/* Wishlist Sidebar */}
      <Wishlist
        isOpen={isWishlistOpen}
        onClose={handleCloseWishlist}
        wishlistItems={wishlistItems}
        loading={loading}
        onRefresh={refreshWishlist}
      />
    </header>
  )
}

export default Header
