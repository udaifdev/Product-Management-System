// AddProduct.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Minus, Upload, X, ChevronDown } from 'lucide-react';
import axiosInstance from '../../axios';

const AddProduct = ({ isOpen, onClose, onProductAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        variants: [
            { ram: '', price: '', quantity: 1 }
        ],
        subCategory: '',
        description: '',
        images: []
    });

    const [subCategories, setSubCategories] = useState([]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const res = await axiosInstance.get('/product/get-sub-Categories');
                console.log('sub categories..........', res.data)
                setSubCategories(res.data.subCategories);
            } catch (error) {
                console.error('Failed to fetch categories........', error);
                toast.error('Unable to load categories..!!');
            }
        };

        if (isOpen) fetchSubCategories(); // fetch only when modal opens
    }, [isOpen]);


    // Fetch categories and subcategories on component mount
    // useEffect(() => {
    //     if (isOpen) {
    //         // fetchCategories();
    //         // fetchSubCategories();
    //     }
    // }, [isOpen]);

    if (!isOpen) return null;

    // Validation rules
    const validateForm = () => {
        const newErrors = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        // Variants validation
        formData.variants.forEach((variant, index) => {
            if (!variant.ram.trim()) {
                newErrors[`variant_ram_${index}`] = 'RAM is required';
            }
            if (!variant.price) {
                newErrors[`variant_price_${index}`] = 'Price is required';
            } else if (variant.price <= 0) {
                newErrors[`variant_price_${index}`] = 'Price must be greater than 0';
            }
            if (variant.quantity < 1) {
                newErrors[`variant_quantity_${index}`] = 'Quantity must be at least 1';
            }
        });

        // Sub category validation
        if (!formData.subCategory) {
            newErrors.subCategory = 'Sub category is required';
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        // Images validation
        if (formData.images.length === 0) {
            newErrors.images = 'At least one image is required';
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
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle variant changes
    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        setFormData(prev => ({
            ...prev,
            variants: updatedVariants
        }));

        // Clear error when user starts typing
        const errorKey = `variant_${field}_${index}`;
        if (errors[errorKey]) {
            setErrors(prev => ({
                ...prev,
                [errorKey]: ''
            }));
        }
    };

    // Add new variant
    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { ram: '', price: '', quantity: 1 }]
        }));
    };

    // Remove variant
    const removeVariant = (index) => {
        if (formData.variants.length > 1) {
            const updatedVariants = formData.variants.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                variants: updatedVariants
            }));
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, {
                            id: Date.now() + Math.random(),
                            src: e.target.result,
                            file: file
                        }]
                    }));
                };
                reader.readAsDataURL(file);
            } else {
                toast.error('Please select only image files');
            }
        });

        // Clear images error
        if (errors.images) {
            setErrors(prev => ({
                ...prev,
                images: ''
            }));
        }
    };

    // Remove image
    const removeImage = (imageId) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
        }));
    };

    // Handle form submission - FIXED
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create FormData object
            const data = new FormData();
            data.append('title', formData.title);
            data.append('subCategory', formData.subCategory);
            data.append('description', formData.description);
            data.append('variants', JSON.stringify(formData.variants));

            // Append all image files
            formData.images.forEach((img) => {
                data.append('images', img.file);
            });

            // Send POST request with FormData directly
            const response = await axiosInstance.post('/product/addProduct', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Handle successful response
            toast.success('Product added successfully!');
            setFormData({
                title: '',
                variants: [{ ram: '', price: '', quantity: 1 }],
                subCategory: '',
                description: '',
                images: []
            });
            setErrors({});

            if (onProductAdded) onProductAdded(response.data);
            onClose();

        } catch (error) {
            console.error('Error adding product:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add product. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle discard
    const handleDiscard = () => {
        setFormData({
            title: '',
            variants: [{ ram: '', price: '', quantity: 1 }],
            subCategory: '',
            description: '',
            images: []
        });
        setErrors({});
        toast.info('Form discarded');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Add Product</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title:
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter product title"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Variants */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Variants:
                            </label>

                            {formData.variants.map((variant, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-2 p-3 border rounded-lg bg-gray-50">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-600 mb-1">Ram:</label>
                                        <input
                                            type="text"
                                            value={variant.ram}
                                            onChange={(e) => handleVariantChange(index, 'ram', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`variant_ram_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="e.g., 4 GB"
                                        />
                                        {errors[`variant_ram_${index}`] && (
                                            <p className="text-red-500 text-sm mt-1">{errors[`variant_ram_${index}`]}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-600 mb-1">Price:</label>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || '')}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`variant_price_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="$ 0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors[`variant_price_${index}`] && (
                                            <p className="text-red-500 text-sm mt-1">{errors[`variant_price_${index}`]}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm text-gray-600 mb-1">QTY:</label>
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => handleVariantChange(index, 'quantity', Math.max(1, variant.quantity - 1))}
                                                className="px-2 py-3 border border-gray-300 rounded-l-md hover:bg-gray-100"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <input
                                                type="number"
                                                value={variant.quantity}
                                                onChange={(e) => handleVariantChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-16 px-2 py-2 border-t border-b border-gray-300 text-center"
                                                min="1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleVariantChange(index, 'quantity', variant.quantity + 1)}
                                                className="px-2 py-3 border border-gray-300 rounded-r-md hover:bg-gray-100"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {errors[`variant_quantity_${index}`] && (
                                            <p className="text-red-500 text-sm mt-1">{errors[`variant_quantity_${index}`]}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-1 flex items-center justify-center">
                                        {formData.variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(index)}
                                                className="px-2 py-1 bg-red-500 mt-4 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                X
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addVariant}
                                className="px-2 py-2 text-xs bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors flex items-center gap-1"
                            >
                                Add variants
                            </button>
                        </div>

                        {/* Sub Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sub category:
                            </label>
                            <div className="relative">
                                <select
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${errors.subCategory ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select category</option>
                                    {(subCategories || []).map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                            {errors.subCategory && <p className="text-red-500 text-sm mt-1">{errors.subCategory}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description:
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter product description..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Upload Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload images:
                            </label>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {formData.images.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <img
                                            src={image.src}
                                            alt="Product"
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(image.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center">
                                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                                        <p className="text-xs text-gray-500">Upload</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleDiscard}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                DISCARD
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-[#EDA415] text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'ADDING...' : 'ADD'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;