// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Provider, useDispatch, useSelector } from 'react-redux';
import Auth from './components/Auth/Auth';
import Products from './pages/Products';
import store from './store';
import { checkAuthStatus } from './slice/authSlice.js';
import 'react-toastify/dist/ReactToastify.css';
import OneProduct from './pages/OneProduct.jsx';

// Main App Component with Redux
const AppContent = () => {
  const dispatch = useDispatch();
  const { checkingAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Show loading spinner while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Products page is now the default route */}
          <Route path="/" element={<Products />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:productId" element={<OneProduct/>} />
        </Routes>

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </BrowserRouter>
  );
};


function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;