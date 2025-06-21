import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Upload, Trash2, Save, Camera } from 'lucide-react';
import { useSelector } from "react-redux"
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom"
import axiosInstance from '../../axios';

const EditProduct = ({ product, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        variants: [],
        images: []
    });
    const [newImages, setNewImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [loading, setLoading] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Initialize form data when product changes
    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || '',
                description: product.description || '',
                variants: product.variants?.map(variant => ({
                    _id: variant._id,
                    ram: variant.ram || '',
                    price: variant.price || 0,
                    quantity: variant.quantity || 0
                })) || [],
                images: product.images || []
            });
            setNewImages([]);
            setImagesToDelete([]);
        }
    }, [product]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, i) =>
                i === index ? { ...variant, [field]: value } : variant
            )
        }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, {
                ram: '',
                price: 0,
                quantity: 0
            }]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setNewImages(prev => [...prev, {
                        file,
                        preview: e.target.result,
                        isNew: true
                    }]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeExistingImage = (imageUrl, index) => {
        setImagesToDelete(prev => [...prev, imageUrl]);
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragStart = (e, index, isNew = false) => {
        setDraggedIndex({ index, isNew });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex, isNewDrop = false) => {
        e.preventDefault();

        if (!draggedIndex) return;

        const { index: dragIndex, isNew: isDragNew } = draggedIndex;

        if (isDragNew && isNewDrop) {
            // Reorder within new images
            const newImagesCopy = [...newImages];
            const [draggedItem] = newImagesCopy.splice(dragIndex, 1);
            newImagesCopy.splice(dropIndex, 0, draggedItem);
            setNewImages(newImagesCopy);
        } else if (!isDragNew && !isNewDrop) {
            // Reorder within existing images
            const imagesCopy = [...formData.images];
            const [draggedItem] = imagesCopy.splice(dragIndex, 1);
            imagesCopy.splice(dropIndex, 0, draggedItem);
            setFormData(prev => ({ ...prev, images: imagesCopy }));
        }

        setDraggedIndex(null);
    };    

    const handleSave = async () => {
         try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('variants', JSON.stringify(formData.variants));
            formDataToSend.append('existingImages', JSON.stringify(formData.images));
            formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));

            // Add new image files
            newImages.forEach((imageObj, index) => {
                formDataToSend.append('newImages', imageObj.file);
            });

            const response = await axiosInstance.put(`/product/update-product/${product._id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                onSave(response.data.product);
                toast.success('Product Updated successfully!');
                onClose();
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const allImages = [
        ...formData.images.map((url, index) => ({ url, index, isNew: false })),
        ...newImages.map((img, index) => ({ url: img.preview, index, isNew: true, file: img.file }))
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900">Edit Product</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter product title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Enter product description"
                            />
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                            <label className="inline-flex text-xs items-center px-2 py-2 bg-myprimary text-white rounded-md hover:bg-blue-300 transition-colors cursor-pointer">
                                <Upload size={16} className="mr-2" />
                                Add Images
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {allImages.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No images uploaded yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {formData.images.map((imageUrl, index) => (
                                    <div
                                        key={`existing-${index}`}
                                        className="relative group border-2 border-gray-200 rounded-lg overflow-hidden cursor-move"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index, false)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index, false)}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-32 object-cover"
                                        />
                                        <button
                                            onClick={() => removeExistingImage(imageUrl, index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}

                                {newImages.map((imageObj, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="relative group border-2 border-green-400 rounded-lg overflow-hidden cursor-move"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index, true)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index, true)}
                                    >
                                        <img
                                            src={imageObj.preview}
                                            alt={`New ${index + 1}`}
                                            className="w-full h-32 object-cover"
                                        />
                                        <button
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                            NEW
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-sm text-gray-500">
                            Drag images to reorder. Green border indicates new images to be uploaded.
                        </p>
                    </div>

                    {/* Variants Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
                            <button
                                onClick={addVariant}
                                className="inline-flex items-center text-xs px-2 py-2 bg-green-700 text-white rounded-md hover:bg-green-900 transition-colors"
                            >
                                <Plus size={16} className="mr-1" />
                                Add Variant
                            </button>
                        </div>

                        {formData.variants.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <p className="text-gray-500">No variants added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                                            {formData.variants.length > 1 && (
                                                <button
                                                    onClick={() => removeVariant(index)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    RAM (GB) *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.ram}
                                                    onChange={(e) => handleVariantChange(index, 'ram', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="e.g., 8, 16, 32"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price ($) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quantity *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.quantity}
                                                    onChange={(e) => handleVariantChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="0"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !formData.title.trim() || formData.variants.length === 0}
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} className="mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;