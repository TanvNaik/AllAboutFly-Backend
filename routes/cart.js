const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user");
const { getUserCart, addProductToCart, updateCart } = require("../controllers/cart");


router.param("userId", getUserById);

router.get("/cart/user/:userId", getUserCart);

router.put("/cart/user/:userId/:productId/:productCost", addProductToCart)
router.put("/cart-update/user/:cartId/:price", updateCart);

module.exports = router;
