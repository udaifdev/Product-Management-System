import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';
import {
    add_Category, add_Sub_Category, get_All_Categories, add_Product, get_All_Sub_Categories, get_All_Products, get_Product_ById, edit_Product
} from '../controllers/productController.js';


const router = express.Router();

router.get('/get-all-product', get_All_Products);
router.get('/getCategories', get_All_Categories);
router.get('/get-sub-Categories', get_All_Sub_Categories);
router.get('/get-product/:productId', get_Product_ById)


router.post('/addCategory', add_Category);
router.post('/addSubCategory', add_Sub_Category);
router.post('/addProduct', upload.array('images', 5), add_Product);


router.put('/update-product/:productId', upload.array('newImages', 5), edit_Product);




export default router;