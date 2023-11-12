const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ProductCartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User"
  },
  products: {
    type: [{
    productId: {
      type: ObjectId,
      ref: "Product"
    },
    count: {
      type: Number,
      default:0
    }
},
],
default:[]},
  price: {
    type: Number  },
});


const OrderSchema = new mongoose.Schema(
  {
    productCart: {
      type: ObjectId,
      ref: "ProductCart"
    },
    // transaction_id: String,
    email: String,
    // invoice:{
    //   type: ObjectId,
    //   ref: "Invoice"
    // },
    amount: {
      type: Number
    },
    address: {
      type: String
    },
    contact_no: Number,
    status: {
      type: String,
      default: "Recieved",
      enum: ["Cancelled", "Delivered", "Shipped", "Processing","Confirmed" ,"Recieved"]
    },
    updated: Date,
    user: {
      type: ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
const ProductCart = mongoose.model("ProductCart", ProductCartSchema);

module.exports = { Order, ProductCart };
