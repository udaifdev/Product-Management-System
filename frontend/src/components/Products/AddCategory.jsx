// AddCategory.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import axiosInstance from '../../axios';


const AddCategory = ({ isOpen, onClose, onCategoryAdded }) => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    // Validation
    const validateForm = () => {
        if (!categoryName.trim()) {
            setError('Category name is required');
            return false;
        }
        if (categoryName.length < 2) {
            setError('Category name must be at least 2 characters');
            return false;
        }
        setError('');
        return true;
    };

    // Handle input change
    const handleInputChange = (e) => {
        setCategoryName(e.target.value);
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/product/addCategory',
                { name: categoryName },
            );
            toast.success('Category added successfully!');

            // Call the onCategoryAdded callback with the new category data
            if (onCategoryAdded) {
                onCategoryAdded(response.data.category);
            }
            // Reset form and close modal
            setCategoryName(''); setError(''); onClose();

        } catch (error) {
            console.error('add category file error............ ', error);
            setError(error.response?.data?.message || 'Failed to add category')
            toast.error(error.response?.data?.message || 'Failed to add category');
            setCategoryName('');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle discard
    const handleDiscard = () => {
        setCategoryName('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Add Category</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <input
                            type="text"
                            value={categoryName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${error ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter category name"
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#EDA415] text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'ADDING...' : 'ADD'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDiscard}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            DISCARD
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;