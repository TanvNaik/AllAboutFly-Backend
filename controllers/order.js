const { Order, ProductCart } = require("../models/order");
const { Product } = require("../models/product");
exports.getUserOrders = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user").populate({
      path: 'productCart',
      model: ProductCart,
    populate: {
      path: "products",
      populate: {
        path: "productId",
        model: Product
      }
    }    })
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: "No orders found in DB",
        });
      }
      return res.json({ orders: orders });
    });
};
exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
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
  return res.json({ order: req.order });
};
exports.createOrder = (req, res) => {
  //create productCartSchema
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
    .populate([
      "user",
      {
        path: "productCart",
        model: ProductCart,
        populate: [
          {
            path: "products",
            populate: [
              {
                path: "productId",
                model: Product,
              },
            ],
          },
        ],
      },
    ])
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: "No orders found in DB",
        });
      }
      res.json(orders);
    });
};

exports.getOrderStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatus = (req, res) => {
  Order.update(
    {
      _id: req.body.orderId,
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
