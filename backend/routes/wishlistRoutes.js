import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { addToWishlist, removeFromWishlist, getAllWishlist } from "../controllers/wishlistController.js"

const router = express.Router()

// Add to wishlist
router.post("/add/:productId", protect, addToWishlist)

// Remove from wishlist
router.delete("/remove/:productId", protect, removeFromWishlist)

// Get all wishlist items
router.get("/get-all-wishlist", protect, getAllWishlist)

export default router
