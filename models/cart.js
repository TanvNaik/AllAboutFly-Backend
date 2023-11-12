const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const cartSchema = new mongoose.Schema(
  {
    user: {
        type: ObjectId,
        ref: "User"
      },
    products: {
        type: [mongoose.Schema.ObjectId], 
        ref: 'ProductCart',
          default: []
    },
    price: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);