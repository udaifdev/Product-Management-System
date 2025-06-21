import User from "../models/User.js"
import Product from "../models/Product.js"
import Wishlist from "../models/Wishlist.js"

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user.id

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId })

    if (!wishlist) {
      // Create new wishlist if doesn't exist
      wishlist = new Wishlist({
        user: userId,
        products: [productId],
      })
    } else {
      // Check if product already in wishlist
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        })
      }

      // Add product to existing wishlist
      wishlist.products.push(productId)
    }

    await wishlist.save()

    // Also update user's wishlist array for consistency
    await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } })

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlistCount: wishlist.products.length,
    })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist",
    })
  }
}

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user.id

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId })

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      })
    }

    // Check if product is in wishlist
    if (!wishlist.products.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product not in wishlist",
      })
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId)

    await wishlist.save()

    // Also update user's wishlist array for consistency
    await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } })

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      wishlistCount: wishlist.products.length,
    })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist",
    })
  }
}

// Get all wishlist items
export const getAllWishlist = async (req, res) => {
  try {
    const userId = req.user.id

    // Find user's wishlist and populate product details
    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "products",
      populate: {
        path: "subCategory",
        populate: {
          path: "category",
        },
      },
    })

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        wishlist: [],
        wishlistCount: 0,
      })
    }

    // Format the wishlist items for frontend
    const formattedWishlist = wishlist.products.map((product) => ({
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.variants && product.variants.length > 0 ? product.variants[0].price : 0,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      subCategory: product.subCategory?.name || "",
      category: product.subCategory?.category?.name || "",
      variants: product.variants || [],
    }))

    res.status(200).json({
      success: true,
      wishlist: formattedWishlist,
      wishlistCount: wishlist.products.length,
    })
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    })
  }
}
