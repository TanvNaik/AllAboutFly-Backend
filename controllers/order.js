const { Order, ProductCart } = require("../models/order");


exports.getUserOrders = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: "No orders found in DB",
        });
      }

      for (let i = 0; i < orders.length; i++) {
        ProductCart.findById(orders[i].productCart)
          .populate({
            path: "products.productId",
            model: "Product",
          })
          .exec((err, productCart) => {
            orders[i].productCart = productCart;
          });
      }
      // Populate products
      return res.json({ orders: orders });
    });
};

exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("user productCart")
    
    .exec(( err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No order found in DB",
        });
      }
      req.order = order;
      next();
    });
};



exports.getOrder = (req, res) => {

  let order = req.order

  return res.json({ order: req.order, products: order.productCart.products });
};
exports.createOrder = (req, res) => {
  
  const productCart = new ProductCart(req.body.order);
  productCart.save((err, prodcart) => {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.productCart = prodcart._id;
    order.save((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to save your order in DB",
        });
      }
      res.json(order);
    });
  });
};

exports.getAllOrders = (req, res) => {
  Order.find()
    .populate("user")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: "No orders found in DB",
        });
      }
      res.json({ orders: orders });
    });
};

exports.getOrderStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatus = (req, res) => {
  Order.findByIdAndUpdate(
    {
      _id: req.order._id,
    },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: "Cannot update order status",
        });
      }
      res.json(order);
    }
  );
};
