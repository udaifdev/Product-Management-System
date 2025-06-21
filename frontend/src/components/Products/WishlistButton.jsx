// WishlistButton.jsx
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../axios';

const WishlistButton = ({
    productId,
    wishlistItems,
    wishlistLoading,
    setWishlistItems,
    setWishlistLoading,
    isAuthenticated
}) => {
    const isInWishlist = wishlistItems.includes(productId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.info('Please sign in to use wishlist');
            return;
        }

        setWishlistLoading((prev) => ({ ...prev, [productId]: true }));

        try {
            const res = isInWishlist
                ? await axiosInstance.delete(`/wishlist/remove/${productId}`)
                : await axiosInstance.post(`/wishlist/add/${productId}`);

            if (res.data.success) {
                setWishlistItems((prev) =>
                    isInWishlist ? prev.filter((id) => id !== productId) : [...prev, productId]
                );
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update wishlist';
            toast.error(message);
        } finally {
            setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={wishlistLoading[productId]}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow-sm border flex items-center justify-center transition-colors
        ${isInWishlist ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' : 'bg-white text-gray-400 hover:text-red-500'}
        ${wishlistLoading[productId] ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {wishlistLoading[productId] ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            )}
        </button>
    );
};

export default WishlistButton;
