
# Product Management System

A full-stack MERN (MongoDB, Express, React, Node.js) web application to manage products, categories, subcategories, and wishlists — designed with clean architecture, responsive UI, and modern development practices.

## 📌 Features

### Authentication
- User registration and login
- JWT-based secure authentication
- Protected routes

### Product Management
- Add, edit, delete products
- Category & sub-category management
- Image upload with Cloudinary
- Smart filtering and pagination
- Image zoom on hover for better user experience

### Wishlist
- Authenticated users can add/remove products to wishlist
- Wishlist saved in database and viewable in sidebar
- Live count in header with real-time updates

### MVC Architecture
- **Models** for database schemas (Product, Category, User, Wishlist)
- **Controllers** for business logic
- **Routes** for clean endpoint handling
- Organized backend folder structure for scalability and maintenance

  
### Tools & Libraries
- React with Redux Toolkit for state management
- Tailwind CSS for styling
- Axios for API requests
- React Toastify for user notifications
- Cloudinary integration
- Multer for image upload handling

---
## 🔧 Tech Stack

| Frontend  | Backend    | Tools      |
|-----------|------------|------------|
| React     | Node.js    | Git + GitHub |
| Redux     | Express.js | Cloudinary |
| Tailwind  | MongoDB    | Postman |
| Axios     | JWT Auth   | Toastify |

# Backend Setup Run 
cd backend
npm install
npm start

# Frontedn Setup Run
cd backend
npm install
npm start
 
### env 
MONGODB_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

## Hosting
Frontend hosted on Vercel
Backend hosted on Render

