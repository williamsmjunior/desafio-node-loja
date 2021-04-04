/**
 * @module lib/product.service
 */

const mongoose = require("mongoose");
const errorCodes = require("./errors");
const Product = require("./product.model");

class ProductService{
    constructor(){
        let mongoUri = process.env.MONGO_URI;
        
        mongoose.connect(mongoUri, { 
            useNewUrlParser: true, 
            useUnifiedTopology : true,
            useCreateIndex : true 
        });
    }

    /**
     * Create a new Product
     * @name create
     * @param {Object} product the product 
     */
    async create(product){
        if(!product){
            throw errorCodes.PRODUCT_REQUIRED
        }
        if(!product.name) {
            throw errorCodes.PRODUCT_NAME_REQUIRED
        }
        if(!product.price || isNaN(product.price)) {
            throw errorCodes.PRODUCT_PRICE_REQUIRED
        }

        let newProduct = {
            name : product.name,
            description : product.description,
            price : product.price,
            available: product.available,
            created : new Date()
        };

        return await Product.create(newProduct);
    }

    /**
     * Returns some product
     * @name getProduct
     * @param {*} id the product id
     */
    async getProduct(id){
        return await Product.findById(id).exec();
    }

    /**
     * Return products based on skip, limit and filter parameters
     * @name getProducts
     * @param {number} skip 
     * @param {number} limit 
     * @param {string} filter 
     */
    async getProducts(skip, limit, filter, sort){
        skip = skip && skip >= 0 ? skip : 0;
        limit = limit && limit >= 0 ? limit : undefined;
        
        let query = {}
        if(filter){
            query["$or"] = [
                {name:{ $regex: `.*${filter}.*`}},
                {description:{$regex: `.*${filter}.*`}}
            ]
        }
        sort = sort ? sort : "created";

        let products = Product.find(query).sort(sort);

        if(skip){
            products = products.skip(skip);
        }

        if(limit){
            products = products.limit(limit);
        }

        let productList = await products.exec();

        let count = await Product.countDocuments(query);

        return {data: productList, count:count};
    }

    /**
     * Delete some product
     * @name delete
     * @param {string} id product id 
     */
    async delete(id){
        return await Product.findByIdAndDelete(id).exec();
    }

    /**
     * @name update
     * @param {*} id the product id 
     * @param {*} product the product
     */
    async update(id, product){
        if(!product){
            throw errorCodes.PRODUCT_REQUIRED
        }
        if(!product.name) {
            throw errorCodes.PRODUCT_NAME_REQUIRED
        }
        if(!product.price || isNaN(product.price)) {
            throw errorCodes.PRODUCT_PRICE_REQUIRED
        }

        let newProduct = {
            name : product.name,
            description : product.description,
            price : product.price,
            available: product.available
        };

        await Product.updateOne({_id:id}, newProduct).exec();
        return Product.findById(id).exec();
    }
}

module.exports = ProductService;