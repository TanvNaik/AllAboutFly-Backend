const Product = require("../models/product");
const formidable = require('formidable');

const { sortBy } = require("lodash");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found"
        });
      }
      req.product = product;
      next();
    });
};
exports.createProduct = (req, res) => {
 
  
 

    //destructuring fields
    const product = new Product(req.body);
    if(!req.files.photo){
      return res.status(400).json({
        error: "Please add all the product details"
      });
    }
      product.photo = req.files.photo[0].filename;


    //save to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Saving t-shirt in DB failed!"
        });
      }

      return res.json(product);
    });
  };

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};



// delete controllers
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedproduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product"
      });
    }
    res.json({
      message: "Deletion was a success"
    });
  });
};

// update controller
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    let product = req.product;
    product = _.extend(product, fields); // fields changed will be updated in product

    //handle files(photos,mp3,etc) here
    

    Product.findByIdAndUpdate(req.params.productId,
      {$set: product}).exec((err, product) => {
        if (err) {
          return res.status(400).json({
            error: "Unable to update product",
          });
          
        }
        return res.json({
          message: "Product Updated successfully"
        })
      })
    
  });
};

// product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Product.find()
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No product found"
        });
      }
      res.json(products);
    });
};

exports.getProductsbyCategory = (req, res) => {
  Product.find({"category": req.params.categoryId}).populate("category")
  .sort([[sortBy, "asc"]])
  .exec((err, products) => {
    if (err) {
      return res.status(400).json({
        error: "No product found"
      });
    }
    res.json(products);
  });
};

exports.updateStock = (req, res, next) => {
  
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } }
      }
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk Operation Failed"
      });
    }
    next();
  });
};
