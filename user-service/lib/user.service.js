/**
 * User service
 * @module lib/user.service
 */
const mongoose = require("mongoose");
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const errorCodes = require("./errors");
const permissions = require("./permissions");
const User = require("./user.model");

class UserService {
    /**
     * @name constructor
     */
    constructor(){
        let mongoUri = process.env.MONGO_URI;
        
        mongoose.connect(mongoUri, { 
            useNewUrlParser: true, 
            useUnifiedTopology : true,
            useCreateIndex : true 
        });
    }

    /**
     * Create some user
     * @name createUser
     * @param {Object} user 
     */
    async createUser(user){
        if(!user){
            throw errorCodes.USER_IS_REQUIRED;
        }
        
        if(!user.username || typeof user.username != "string" || user.username.trim() == ""){
            throw errorCodes.USERNAME_EMPTY;
        }
        
        if(!user.password || typeof user.password != "string" || user.password.trim() == ""){
            throw errorCodes.USER_PASSWORD_EMPTY;
        }

        let newUser = {
            username : user.username,
            password : await this._encryptPassword(user.password),
            permissions : []
        };

        if(user.permissions){
            for(let permission of user.permissions){
                if(permissions[permission]){
                    newUser.permissions.push(permission);
                }
            }
        }

        return await User.create(newUser);
    }

    /**
     * Returns a JWT token if credentials are ok
     * @name authenticate
     * @param {Object} credentials user credentials
     */
    async authenticate(credentials){
        let localUser = await this.getUser(credentials.username);
        
        if(!localUser || localUser == null || !(await this._PasswordMatch(credentials.password, localUser.password))){
            throw errorCodes.AUTHENTICATION_ERROR;
        }
        let tokenContent = {
            username : localUser.username,
            permissions : localUser.permissions
        }
        let secret = process.env.JWT_SECRET;
        return jwt.sign(tokenContent, secret);
    }
    

    /**
     * Return some user 
     * @name getUser
     * @param {string} username 
     */
    async getUser(username){
        return await User.findOne({username : username}).exec();
    }

    /**
     * Return the password hash using bcrypt
     * @name _encryptPassword
     * @param {*} password 
     */
    async _encryptPassword(password){
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Return true if the password and hash match
     * @name _PasswordMatch
     * @param {*} password 
     * @param {*} hash 
     */
    async _PasswordMatch(password, hash){
        return bcrypt.compare(password, hash);
    }
}

module.exports = UserService;