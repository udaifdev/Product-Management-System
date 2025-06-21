import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from '../models/Product.js'
import { uploadToCloudinary } from '../utils/cloudinary.js';



export const get_All_Categories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

export const get_All_Sub_Categories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().sort({ createdAt: -1 });
        res.status(200).json({ subCategories });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sub categories' });
    }
};



export const add_Sub_Category = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        console.log('----->', name, '----->', categoryId)

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: 'Subcategory name must be at least 2 characters' });
        }
        if (!categoryId) return res.status(400).json({ message: 'Category ID is required' });

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const newSubCategory = await SubCategory.create({
            name: name.trim(),
            category: categoryId
        });
        res.status(201).json({ message: 'Sub-category added successfully', subCategory: newSubCategory });

    } catch (error) {
        console.error('Add SubCategory Error............', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Add Category Post Controller
export const add_Category = async (req, res) => {
    try {
        const { name } = req.body;
        // Validation
        if (!name || name.trim().length < 2) return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters' });

        // Check if category already exists
        const exists = await Category.findOne({ name: name.trim() });
        if (exists) return res.status(400).json({ success: false, message: 'Category already exists' });

        // Create category
        const newCategory = await Category.create({ name: name.trim() });
        res.status(201).json({ success: true, message: 'Category added successfully', category: newCategory });

    } catch (error) {
        console.error('Add category error...........', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// Add Product Controller
export const add_Product = async (req, res) => {
    try {
        const { title, description, subCategory, variants } = req.body;

        // Validation
        if (!title || !description || !subCategory || !variants) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        // Parse variants from JSON string
        let parsedVariants;
        try {
            parsedVariants = JSON.parse(variants);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid variants format' });
        }

        // Validate variants
        if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
            return res.status(400).json({ message: 'At least one variant is required' });
        }

        // Validate each variant
        for (const variant of parsedVariants) {
            if (!variant.ram || !variant.price || !variant.quantity) {
                return res.status(400).json({ message: 'Each variant must have ram, price, and quantity' });
            }
            if (variant.price <= 0 || variant.quantity < 1) {
                return res.status(400).json({ message: 'Price must be greater than 0 and quantity must be at least 1' });
            }
        }

        // Upload images to Cloudinary
        const uploadedImages = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer, `${Date.now()}_${file.originalname}`))
        );

        // Create new product
        const newProduct = await Product.create({
            title, // Changed from 'name' to 'title' to match frontend
            description,
            subCategory,
            variants: parsedVariants,
            images: uploadedImages
        });

        res.status(201).json({
            message: 'Product added successfully',
            product: newProduct
        });

    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Get Product List Controller
export const get_All_Products = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filters = {};

        if (req.query.category) {
            const subCategories = await SubCategory.find({ category: req.query.category });
            filters.subCategory = { $in: subCategories.map(sc => sc._id) };
        }

        if (req.query.subCategory) {
            filters.subCategory = req.query.subCategory;
        }

        const total = await Product.countDocuments(filters);
        const products = await Product.find(filters)
            .populate({ path: 'subCategory', populate: { path: 'category' } })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // console.log('products.......', products)

        res.status(200).json({ products, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// GET /product/get-product/:id
export const get_Product_ById = async (req, res) => {
    try {
        const productId = req.params.productId;
        // Find product by ID
        const product = await Product.findById(productId)
            .populate("subCategory") // optional
            .populate("subCategory.category"); // optional nested populate
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, product });

    } catch (error) {
        console.error("Error getting product...........", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



// Edit Product Controller
export const edit_Product = async (req, res) => {
    try {
        const { productId } = req.params;
        const { title, description, variants, existingImages, imagesToDelete } = req.body;
        // Validation
        if (!title || !description || !variants) return res.status(400).json({ message: 'Title, description, and variants are required' });

        // Check if product exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

        // Parse variants from JSON string
        let parsedVariants;
        try {
            parsedVariants = JSON.parse(variants);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid variants format' });
        }

        // Validate variants
        if (!Array.isArray(parsedVariants) || parsedVariants.length === 0)     return res.status(400).json({ message: 'At least one variant is required' });
        
        // Validate each variant
        for (const variant of parsedVariants) {
            if (!variant.ram || variant.price === undefined || variant.quantity === undefined) {
                return res.status(400).json({ message: 'Each variant must have ram, price, and quantity' });
            }
            if (variant.price < 0 || variant.quantity < 0) {
                return res.status(400).json({ message: 'Price and quantity cannot be negative' });
            }
        }

        // Parse existing images
        let parsedExistingImages = [];
        try {
            parsedExistingImages = JSON.parse(existingImages || '[]');
        } catch (error) {
            console.log('Error parsing existing images:', error);
        }

        // Parse images to delete
        let parsedImagesToDelete = [];
        try {
            parsedImagesToDelete = JSON.parse(imagesToDelete || '[]');
        } catch (error) {
            console.log('Error parsing images to delete:', error);
        }

        // Delete images from Cloudinary if specified
        if (parsedImagesToDelete.length > 0) {
            try {
                await Promise.all(
                    parsedImagesToDelete.map(async (imageUrl) => {
                        // Extract public_id from Cloudinary URL
                        const urlParts = imageUrl.split('/');
                        const fileNameWithExtension = urlParts[urlParts.length - 1];
                        const publicId = `products/products/${fileNameWithExtension}`;
                        
                        // Delete from Cloudinary
                        await cloudinary.uploader.destroy(publicId);
                    })
                );
            } catch (deleteError) {
                console.error('Error deleting images from Cloudinary:', deleteError);
                // Continue with update even if image deletion fails
            }
        }

        // Upload new images to Cloudinary
        let newUploadedImages = [];
        if (req.files && req.files.length > 0) {
            try {
                newUploadedImages = await Promise.all(
                    req.files.map(file => 
                        uploadToCloudinary(file.buffer, `${Date.now()}_${file.originalname}`)
                    )
                );
            } catch (uploadError) {
                console.error('Error uploading new images:', uploadError);
                return res.status(500).json({ message: 'Failed to upload new images' });
            }
        }

        // Combine existing images with new uploaded images
        const finalImages = [...parsedExistingImages, ...newUploadedImages];

        // Validate that we have at least one image
        if (finalImages.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        // Prepare variants data - preserve existing _id for existing variants
        const processedVariants = parsedVariants.map(variant => {
            if (variant._id) {
                // Existing variant - keep the _id
                return {
                    _id: variant._id,
                    ram: variant.ram,
                    price: Number(variant.price),
                    quantity: Number(variant.quantity)
                };
            } else {
                // New variant - let MongoDB generate new _id
                return {
                    ram: variant.ram,
                    price: Number(variant.price),
                    quantity: Number(variant.quantity)
                };
            }
        });

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                title,
                description,
                variants: processedVariants,
                images: finalImages
            },
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        ).populate('subCategory');

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Failed to update product' });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Edit Product Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};
