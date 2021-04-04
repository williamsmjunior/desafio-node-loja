/**
 * User controller
 * @module lib/user.controller
 */
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const permissions = require("./permissions");

const UserService = require("./user.service");
const userService = new UserService();

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
 * Create an user with(out) permissions<br>
 * The
 * @name CreateUser
 * @route {POST} /
 * @bodyparam {string} username the user name
 * @bodyparam {string} password the user password
 * @bodyparam {array} permissions the array with user permissions
 */
router.post("/", authenticated, hasPermission(permissions.ADMIN), async function(req, res){
    try{
        let user = await userService.createUser(req.body); 
        res.status(201).send(user);
    } catch(e){
        res.status(400).send(e);
    }
});

/**
 * Returns the user auth JWT token
 * @name Auth
 * @route {POST} /auth
 * @bodyparam {string} username the user name
 * @bodyparam {string} password the user password
 */
router.post("/auth", async function(req, res){
    try{
        let token =  await userService.authenticate(req.body); 
        res.status(200).send({token:token});
    } catch(e){
        console.log(e);
        res.status(401).send(e);
    }
});

module.exports = router;