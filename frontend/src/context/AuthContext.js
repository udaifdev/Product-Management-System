//AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../axios'

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    SIGNUP_START: 'SIGNUP_START',
    SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
    SIGNUP_FAILURE: 'SIGNUP_FAILURE',
    LOGOUT: 'LOGOUT',
    CHECK_AUTH_SUCCESS: 'CHECK_AUTH_SUCCESS',
    CHECK_AUTH_FAILURE: 'CHECK_AUTH_FAILURE',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
        case AUTH_ACTIONS.SIGNUP_START:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
        case AUTH_ACTIONS.SIGNUP_SUCCESS:
        case AUTH_ACTIONS.CHECK_AUTH_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_FAILURE:
        case AUTH_ACTIONS.SIGNUP_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.CHECK_AUTH_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check authentication status on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await axiosInstance.get('/users/check-auth');
            if (response.data.success) {
                dispatch({
                    type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS,
                    payload: response.data,
                });
            }
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.CHECK_AUTH_FAILURE,
            });
        }
    };

    
    const login = async (email, password) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOGIN_START });

            const response = await axiosInstance.post('/users/login', {
                email,
                password,
            });

            if (response.data.success) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: response.data,
                });
                return { success: true, message: response.data.message };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage,
            });
            return { success: false, message: errorMessage };
        }
    };

    const signup = async (name, email, password) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SIGNUP_START });

            const response = await axiosInstance.post('/users/signup', { name, email, password, });

            if (response.data.success) {
                dispatch({ type: AUTH_ACTIONS.SIGNUP_SUCCESS, payload: response.data, });
                return { success: true, message: response.data.message };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Signup failed';
            dispatch({ type: AUTH_ACTIONS.SIGNUP_FAILURE,payload: errorMessage,});
            return { success: false, message: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/users/logout');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
            return { success: true, message: 'Logged out successfully' };
        } catch (error) {
            console.error('Logout error:', error);
            // Even if the server request fails, we should still log out locally
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
            return { success: true, message: 'Logged out successfully' };
        }
    };

    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    const value = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        login,
        signup,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};