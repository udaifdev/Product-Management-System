import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, Minus, Plus } from 'lucide-react';
import axiosInstance from '../../axios';
import EditProduct from './EditProduct';
import { useSelector } from "react-redux"
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom"

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axiosInstance.get(`/product/get-product/${productId}`);
                const data = res.data.product || res.data;
                setProduct(data);

                // Initialize with first variant if available
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                }
            } catch (err) {
                console.error('Failed to load product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const { userInfo, isAuthenticated } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
    };

    const handleQuantityChange = (change) => {
        setQuantity(prev => Math.max(1, prev + change));
    };

    const handleAddToWishlist = () => {
        setIsWishlisted(!isWishlisted);
    };

    const handleEditProduct = () => {
        if (!isAuthenticated || !userInfo) {
            toast.error("Please sign in!")
            navigate("/auth")
        }
        setIsEditModalOpen(true);
    };
    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };
    const handleProductSave = (updatedProduct) => {
        setProduct(updatedProduct);
        // Reset selected variant to first variant of updated product
        if (updatedProduct.variants && updatedProduct.variants.length > 0) {
            setSelectedVariant(updatedProduct.variants[0]);
        }
        // Reset selected image
        setSelectedImage(0);
    };

    const handleBuyNow = () => {
        console.log('Buy now:', {
            product: product?._id,
            quantity,
            variant: selectedVariant,
        });
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
    };

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    if (loading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading product details...</p>
            </div>
        );
    }


    return (
        <div className="max-w-7xl mx-auto p-4 min-h-screen">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-900 m-8">
                <Link to={'/products'}>
                    <span className="hover:text-gray-900 cursor-pointer">Home</span>
                </Link>
                <ChevronRight size={16} />
                <span className="hover:text-gray-900 cursor-pointer">Product Details</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Images with Zoom */}
                <div className="space-y-4">
                    {/* Main Image with Custom Zoom - UPDATED SECTION */}
                    <div className="bg-white rounded-lg border p-8 flex items-center justify-center h-96 relative overflow-hidden">
                        <div
                            className="relative cursor-zoom-in max-w-full max-h-full"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                src={product.images?.[selectedImage]}
                                alt={product.title}
                                className="max-w-full max-h-full object-contain transition-transform duration-200"
                                style={{
                                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Thumbnail Images - NO CHANGES */}
                    <div className="flex space-x-4">
                        {product.images?.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`bg-white rounded-lg border-2 p-4 flex items-center justify-center h-24 w-24 transition-colors ${selectedImage === index
                                    ? 'border-blue-500'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <img
                                    src={image}
                                    alt={`View ${index + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info - NO CHANGES */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{product.title}</h1>
                        <p className="text-3xl font-bold text-gray-900">
                            ${selectedVariant?.price?.toLocaleString() || 'N/A'}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Availability:</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600 font-medium">
                                {selectedVariant?.quantity > 0 ? 'In stock' : 'Out of stock'}
                            </span>
                        </div>
                    </div>

                    {selectedVariant?.quantity && selectedVariant.quantity < 10 && (
                        <p className="text-sm text-gray-600">
                            Hurry up! only {selectedVariant.quantity} left in stock!
                        </p>
                    )}

                    {/* Product Description */}
                    {product.description && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700">Description:</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                        </div>
                    )}

                    <hr className="border-gray-200 my-4" />

                    {/* Variants - RAM Selection */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">RAM :</label>
                            <div className="flex space-x-2">
                                {product.variants.map((variant) => (
                                    <button
                                        key={variant._id}
                                        onClick={() => handleVariantChange(variant)}
                                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${selectedVariant?._id === variant._id
                                            ? 'border-gray-800 bg-gray-800 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        {variant.ram}GB - ${variant.price.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Quantity :</label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                disabled={quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-16 h-10 border border-gray-300 text-center"
                                min="1"
                                max={selectedVariant?.quantity || 1}
                            />
                            <button
                                onClick={() => handleQuantityChange(1)}
                                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                disabled={quantity >= (selectedVariant?.quantity || 1)}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        {selectedVariant?.quantity && (
                            <p className="text-xs text-gray-500">
                                Max available: {selectedVariant.quantity}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <button
                            onClick={handleEditProduct}
                            className="flex-1 bg-[#EDA415] hover:bg-orange-300 text-white py-3 px-6 rounded-full font-medium transition-colors"
                        >
                            Edit product
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 bg-[#EDA415] hover:bg-orange-300 text-white py-3 px-6 rounded-full font-medium transition-colors"
                            disabled={!selectedVariant || selectedVariant.quantity < quantity}
                        >
                            Buy it now
                        </button>
                        <button
                            onClick={handleAddToWishlist}
                            className={`p-3 border rounded-full transition-colors ${isWishlisted
                                ? 'border-red-500 text-red-500 bg-red-50'
                                : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                }`}
                        >
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>
            </div>
            <EditProduct
                product={product}
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSave={handleProductSave}
            />
        </div>
    );
};

export default ProductDetails;