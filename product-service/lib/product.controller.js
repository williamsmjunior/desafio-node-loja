/**
 * Product controller
 * @module lib/product.controller
 */
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const permissions = require("./permissions");
const errorCodes = require("./errors");

const ProductService = require("./product.service");
const productService = new ProductService();

/**
 * Express helper to verify if the authorization header is correct<br>
 * It expects a string `Bearer ${token}` on authorization header
 * @name authenticated
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function authenticated(req, res, next){
    let authHeader = req.headers.authorization;
    
    if(!authHeader){
        return res.status(401).send();
    }
    
    authHeader = authHeader.split(" ");

    if(authHeader.length != 2 || authHeader[0] !== "Bearer"){
        return res.status(401).send();
    }
    let token = authHeader[1];
    let secret = process.env.JWT_SECRET;
    try{
        let user = jwt.verify(token, secret);
        req.user = user;
        return next();
    } catch(e){
        return res.status(401).send();
    }

}

/**
 * Express helper that verify if the current user has some permission
 * @name hasPermission
 * @param {*} requiredPermission 
 */
function hasPermission(requiredPermission){

    return function(req, res, next){
        if(!req.user){
            return res.status(403).send();
        }
        for(let permission of req.user.permissions){
            if(requiredPermission === permission){
                return next();
            }
        }
        return res.status(403).send();
    }
}

/**
 * @name CreateProduct
 * @route {POST} /
 * @headerparam {string} authorization the authorization header verified by authenticated
 * @bodyparam {string} name the product name
 * @bodyparam {string} [description] the product description
 * @bodyparam {number} price the product price
 * @bodyparam {boolean} [available=true] is true if product is available
 */
router.post("/", authenticated, hasPermission(permissions.MANAGE_PRODUCTS), async function(req, res){
    try{
        let product = await productService.create(req.body);
        return res.status(201).send(product);
    } catch(e){
        return res.status(400).send(e);
    }
});

/**
 * @name EditProduct
 * @route {PUT} /
 * @headerparam {string} authorization the authorization header verified by authenticated
 * @routeparam {string} id the product id
 * @bodyparam {string} name the product name
 * @bodyparam {string} [description] the product description
 * @bodyparam {number} price the product price
 * @bodyparam {boolean} [available=true] is true if product is available
 */
router.put("/:id", authenticated, hasPermission(permissions.MANAGE_PRODUCTS), async function(req, res){
    try{
        let id = req.params.id;
        let product = await productService.update(id, req.body);
        return res.status(200).send(product);
    } catch(e){
        return res.status(400).send(e);
    }
});

/**
 * @name DeleteProduct
 * @route {DELETE} /
 * @headerparam {string} authorization the authorization header verified by authenticated
 * @routeparam {string} id the product id
 */
router.delete("/:id", authenticated, hasPermission(permissions.MANAGE_PRODUCTS), async function(req, res){
    try{
        let id = req.params.id;
        let result = await productService.delete(id);
        if(result == null){
            return res.status(404).send(errorCodes.PRODUCT_NOT_FOUND);
        }
        return res.status(200).send(result);
    } catch(e){
        return res.status(400).send(e);
    }
});

/**
 * @name GetProduct
 * @route {GET} /:id
 * @routeparam {string} id the product id
 */
router.get("/:id", async function(req, res){
    try{
        let id = req.params.id;
        let product = await productService.getProduct(id);
        return res.status(200).send(product);
    } catch(e){
        return res.status(400).send(e);
    }
});

/**
 * @name GetProducts
 * @route {GET} /
 * @queryparam {string} [q] String to search/filter products 
 * @queryparam {number} [skip=0] Skip param
 * @queryparam {number} [limit=20] limit param
 */
router.get("/", async function(req, res){
    let skip = req.query.skip || 0;
    skip = parseInt(skip);
    let limit = req.query.limit || 20;
    limit = parseInt(limit);
    let filter = req.query.q || "";
    
    try{
        let products = await productService.getProducts(skip, limit, filter);
        return res.status(200).send(products);
    } catch(e){
        console.log(e);
        return res.status(400).send(e);
    }
});

module.exports = router;