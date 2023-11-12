const cart = require("../models/cart");
const {ProductCart} = require("../models/order");
const Product = require("../models/product");

// Get user cart
exports.getUserCart = (req, res) => {
  ProductCart.find({ user: req.profile._id }).populate([{
    path: "products",
    populate: [{
      path: 'productId',
      model: Product
    }]
  }]).exec((err, cart) => {

  
    if (err || cart.length == 0) {
      return res.status(400).json({
        error: "Cart Not Found",
      });
    }
    
    return res.json({
      cart: cart[0].products,
      price: cart[0].price,
      _id: cart[0]._id
    });
  });
};

// Add product to cart
exports.addProductToCart = (req, res) => {
  ProductCart.findOne({
    user: req.profile._id
  }).exec((err, cart) => {
    if(err || !cart){

      const product =
        {
        productId: req.params.productId,
        count: 1
      }

      
        ProductCart.findOneAndUpdate({user: req.profile._id},
          {$set: {products:[product]},
          price: parseFloat(req.params.productCost)
        },
          { new: true, upsert: true,  useFindAndModify: false }
          ).exec(
            (err, item) => {
              if (err) {
                return res.status(400).json({
                  error: "Unable to add product to the cart",
                });
                
              }
              return res.json({
                message: "Added to cart"
              })
            }
          );
     
    }
    else{
      let flag = 0;
      for(let i = 0; i< cart.products.length; i++){
        if(cart.products[i].productId == req.params.productId){
          cart.products[i].count++,
          cart.price += parseFloat(req.params.productCost)
          flag++
        }
      }
      if(flag == 0){
        cart.products.push({
          productId: req.params.productId,
          count: 1
        })
        cart.price += parseFloat(req.params.productCost)

      }
      ProductCart.findOneAndUpdate({user: req.profile._id},
        {$set: {products: cart.products},
        price: cart.price
      },
        { new: true, upsert: true,  useFindAndModify: false }
        ).exec(
          (err, item) => {
            if (err) {
              return res.status(400).json({
                error: "Unable to add product to the cart",
              });
             
            }
            return res.json({
              message: "Added to cart"
            })
          }
        );
    }
  })
  
};

//  remove product from cart
exports.removeProductfromCart = (req, res) => {
  cart.findOneAndUpdate(
    { user: req.profile._id },
    { $pull: { products: req.params.productId } },
    { new: true ,  useFindAndModify: false  },
    { includeResultMetadata: true },
    (err, item) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to remove product to the cart. Please try again later",
        });
      }
    }
  );
};

exports.updateCart = (req, res) => {
  ProductCart.findOneAndUpdate(
    { _id: req.params.cartId },
    { $set: { products: req.body.newProducts , price: req.params.price } },
    { new: true ,  useFindAndModify: false  },
    (err, item) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to update the cart. Please try again later",
        });
      }
      
    }
  );
};
