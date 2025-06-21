import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../axios"

const initialState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
}

// Async thunks for wishlist operations
export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/wishlist/get-all-wishlist")
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist")
  }
})

export const addToWishlist = createAsyncThunk("wishlist/addToWishlist", async (productId, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/wishlist/add/${productId}`, {})
    return { ...data, productId }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to add item to wishlist")
  }
})

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/wishlist/remove/${productId}`)
      return { ...data, productId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove item from wishlist")
    }
  },
)

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = []
      state.count = 0
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.wishlist || []
        state.count = action.payload.wishlistCount || 0
        state.error = null
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.count = action.payload.wishlistCount || state.count + 1
        // Add productId to items array for quick lookup
        if (!state.items.find((item) => item._id === action.payload.productId)) {
          state.items.push({ _id: action.payload.productId })
        }
        state.error = null
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.count = action.payload.wishlistCount || Math.max(0, state.count - 1)
        // Remove productId from items array
        state.items = state.items.filter((item) => item._id !== action.payload.productId)
        state.error = null
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearWishlist, clearError } = wishlistSlice.actions
export default wishlistSlice.reducer
