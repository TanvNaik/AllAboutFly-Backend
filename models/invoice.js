const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const invoiceSchema = mongoose.Schema({
    sender:{
        type: mongoose.Schema.ObjectId, 
      ref: 'User', 
    },transaction_details:{
        type: Object
      },
    order:{
        type: mongoose.Schema.ObjectId, 
      ref: 'Order', 

    },

},{timestamps:true})



module.exports = mongoose.model("Invoice", invoiceSchema)