// Auth.jsx
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, signupUser, clearError } from '../../slice/authSlice.js';
import 'react-toastify/dist/ReactToastify.css';

const Auth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Clear errors when component mounts or mode changes
  useEffect(() => {
    dispatch(clearError());
  }, [isSignUp, dispatch]);

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const errors = {};
    if (isSignUp && !formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) errors.email = 'Invalid email format';

    if (!formData.password.trim()) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (isSignUp) {
      if (!formData.confirmPassword.trim()) errors.confirmPassword = 'Confirm your password';
      else if (formData.confirmPassword !== formData.password) errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear specific field error when user starts typing
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: '' });
    // Clear general error
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted errors");
      return;
    }

    try {
      let result;
      
      if (isSignUp) {
        result = await dispatch(signupUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })).unwrap();
      } else {
        result = await dispatch(loginUser({
          email: formData.email,
          password: formData.password
        })).unwrap();
      }

      if (result.success) {
        toast.success(result.message);
        // Navigation will happen automatically due to the Navigate component above
      }
    } catch (error) {
      // Error is already handled by Redux and shown via useEffect
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    dispatch(clearError());
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('Forgot password functionality not implemented yet');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Sliding Blue Panel */}
        <div className={`absolute top-0 w-1/2 h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-700 ease-in-out z-10 ${isSignUp ? 'left-0' : 'left-1/2'
          }`}>
          <div className="absolute top-20 left-20 w-16 h-16 bg-blue-500 opacity-30 rotate-45 rounded-lg"></div>
          <div className="absolute top-40 right-16 w-8 h-8 bg-blue-400 opacity-40 rotate-45 rounded"></div>
          <div className="absolute bottom-32 left-16 w-12 h-12 bg-blue-300 opacity-25 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-6 h-6 bg-blue-400 opacity-50 rotate-45"></div>
          <div className="absolute top-60 left-32 w-20 h-20 bg-blue-500 opacity-20 rounded-full"></div>

          <div className="flex flex-col items-center justify-center h-full text-white px-12">
            {isSignUp ? (
              <>
                <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
                <p className="text-lg text-center mb-8 leading-relaxed">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  onClick={toggleMode}
                  disabled={loading}
                  className="border-2 border-white text-white px-12 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SIGN IN
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-6">Hello Friend!</h2>
                <p className="text-lg text-center mb-8 leading-relaxed">
                  Enter your personal details and start your journey with us
                </p>
                <button
                  onClick={toggleMode}
                  disabled={loading}
                  className="border-2 border-white text-white px-12 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SIGN UP
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sign Up / Sign In Form */}
        <div className={`absolute top-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 ease-in-out ${isSignUp ? 'right-0' : 'left-0'
          }`}>
          <div className="w-full max-w-md px-8">
            <h2 className="text-3xl font-bold text-orange-500 mb-8 text-center">
              {isSignUp ? 'Create Account' : 'Sign In to Your Account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-500 disabled:opacity-50"
                  />
                  {formErrors.name && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>
                  )}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-500 disabled:opacity-50"
                />
                {formErrors.email && (
                  <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formErrors.password && (
                  <div className="text-red-500 text-sm mt-1">{formErrors.password}</div>
                )}
              </div>

              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder-gray-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {formErrors.confirmPassword && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</div>
                  )}
                </div>
              )}

              {!isSignUp && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-gray-600 hover:text-gray-800 text-sm underline"
                  >
                    forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-4 rounded-full font-semibold text-lg hover:from-orange-500 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isSignUp ? 'SIGNING UP...' : 'SIGNING IN...'}
                  </div>
                ) : (
                  isSignUp ? 'SIGN UP' : 'SIGN IN'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;