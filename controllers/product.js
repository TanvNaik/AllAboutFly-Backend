const Product = require("../models/product");

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
 
  
 
    console.log("no err in form.parse")

    //destructuring fields
    const product = new Product(req.body);
    console.log(product)
      product.photo = req.files.photo[0].filename;
      console.log(product)


    //save to DB
    product.save((err, product) => {
      if (err) {
        console.log("inside error")
        return res.status(400).json({
          error: "Saving t-shirt in DB failed!"
        });
      }
      console.log("inside create")

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
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    let product = req.product;
    product = _.extend(product, fields); // fields changed will be updated in product

    //handle files(photos,mp3,etc) here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!"
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //save to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Updation of product failed!"
        });
      }
      res.json(product);
    });
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
