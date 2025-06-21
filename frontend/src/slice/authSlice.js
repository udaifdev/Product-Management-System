// slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../axios';

const initialState = {
    userInfo: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    checkingAuth: true // For initial auth check
}

// Async thunks for API calls
export const checkAuthStatus = createAsyncThunk(
    'auth/checkAuthStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/users/check-auth');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Auth check failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/users/login', { email, password });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/users/signup', { name, email, password });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Signup failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/users/logout');
            return { message: 'Logged out successfully' };
        } catch (error) {
            // Even if server request fails, we should log out locally
            return { message: 'Logged out successfully' };
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.userInfo = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.checkingAuth = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Check Auth Status
            .addCase(checkAuthStatus.pending, (state) => {
                state.checkingAuth = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.checkingAuth = false;
                state.isAuthenticated = true;
                state.userInfo = action.payload.user;
                state.error = null;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.checkingAuth = false;
                state.isAuthenticated = false;
                state.userInfo = null;
                state.error = null;
            })
            
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.userInfo = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.userInfo = null;
                state.error = action.payload;
            })
            
            // Signup
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.userInfo = action.payload.user;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.userInfo = null;
                state.error = action.payload;
            })
            
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.userInfo = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            });
    }
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;