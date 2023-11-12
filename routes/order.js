const express = require("express");
const router = express.Router();

const {
  getOrderById,
  createOrder,
  getAllOrders,
  updateStatus,
  getOrderStatus,
  getUserOrders,
  getOrder
} = require("../controllers/order");
const {
  isSignedIn,
  isAuthenticated,
  isAdmin
} = require("../controllers/authentication");
const {
  getUserById,
  pushOrdersInPurchaseList
} = require("../controllers/user");
const { updateStock } = require("../controllers/product");

// params
router.param("userId", getUserById);
router.param("orderId", getOrderById);

// Actual routes

// create order
router.post(
  "/order/create/:userId",
  isSignedIn,
  isAuthenticated,
  updateStock,
  createOrder
);

// read route
router.get(
  "/order/all/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllOrders
);
router.get("/orders/:userId", getUserOrders)
router.get("/orders/:orderId", getOrder)

// status routes
router.get(
  "/order/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getOrderStatus
);
router.put(
  "/order/:orderId/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateStatus
);
module.exports = router;
