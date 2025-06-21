// AddSubCategory.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, ChevronDown } from 'lucide-react';
import axiosInstance from '../../axios';

const AddSubCategory = ({ isOpen, onClose, onSubCategoryAdded }) => {
    const [formData, setFormData] = useState({
        category: '',
        subCategoryName: ''
    });
    const [categories, setCategories] = useState([]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get('/product/getCategories');
                setCategories(res.data.categories);
            } catch (error) {
                console.error('Failed to fetch categories........', error);
                toast.error('Unable to load categories..!!');
            }
        };

        if (isOpen) fetchCategories(); // fetch only when modal opens
    }, [isOpen]);

    if (!isOpen) return null;

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.subCategoryName.trim()) {
            newErrors.subCategoryName = 'Sub category name is required';
        } else if (formData.subCategoryName.length < 2) {
            newErrors.subCategoryName = 'Sub category name must be at least 2 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/product/addSubCategory', {
                name: formData.subCategoryName,
                categoryId: formData.category
            });
            toast.success('Sub-category added successfully!');

            if (onSubCategoryAdded) {
                onSubCategoryAdded(response.data.subCategory);
            }
            setFormData({ category: '', subCategoryName: '' });
            setErrors({});
            onClose();

        } catch (error) {
            console.error('add sub category file error............ ', error);
            toast.error(error.response?.data?.message || 'Failed to add sub-category');
            setErrors({ msg: error.response?.data?.message || 'Failed to add category' })
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle discard
    const handleDiscard = () => {
        setFormData({
            category: '',
            subCategoryName: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Add Sub Category</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        {/* Category Selection */}
                        <div>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none ${errors.category ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}

                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                        </div>

                        {/* Sub Category Name */}
                        <div>
                            <input
                                type="text"
                                name="subCategoryName"
                                value={formData.subCategoryName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.subCategoryName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter sub category name"
                            />
                            {errors.subCategoryName && <p className="text-red-500 text-sm mt-1">{errors.subCategoryName}</p>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#EDA415] text-white py-3 rounded-lg font-medium hover:bg-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AddSubCategory;