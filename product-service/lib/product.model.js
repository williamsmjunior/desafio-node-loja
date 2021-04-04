/**
 * Product schema
 * @module lib/product.model
 */

const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    created : Date,
    name : {
        type: String,
        required: true
    },

    description : String,
    
    price :{
        type: Number,
        required: true
    },

    available : {
        type : Boolean,
        default: true
    }
    
});

ProductSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        delete ret.__v;
        return ret;
    }
};

module.exports = mongoose.model("Product", ProductSchema);