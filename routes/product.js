const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path")


const {
  getProductById,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsbyCategory
} = require("../controllers/product");
const {
  isSignedIn,
  isAuthenticated,
  isAdmin
} = require("../controllers/authentication");
const { getUserById } = require("../controllers/user");

const fileStorageEngine = multer.diskStorage({
  destination: (req,file,cb) =>{
      cb(null,path.join(__dirname, "../uploads/images"))  
  },
  filename: (req,file,cb) =>{
      cb(null, Date.now() + "--" + file.originalname)
  }
})
const upload = multer({storage: fileStorageEngine})


// Params
router.param("productId", getProductById);
router.param("userId", getUserById);

//actual routes

//create route
router.post(
  "/product/create/:userId",
  upload.fields([{
    name: 'photo', maxCount: 1
  }]),
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

//read routes
router.get("/product/:productId", getProduct);
router.get("/products/:categoryId", getProductsbyCategory)

//delete route
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

//update route
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

//listing route
router.get("/products", getAllProducts);


module.exports = router;
