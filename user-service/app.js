/**
 * User Service rest API
 * @module app.js
 */

const express = require("express");
const app = express();
const userController = require("./lib/user.controller");
const argv = require('minimist')(process.argv.slice(2));

if(argv.seed == true){
    const permissions = require("./lib/permissions");
    const UserService = require("./lib/user.service");
    const userService = new UserService();
    let admin = {
        username : "admin",
        password : "password#123",
        permissions : [permissions.ADMIN,permissions.MANAGE_PRODUCTS]
    }
    
    userService.createUser(admin).then(user =>{
        console.log(`Seed ok ${user}`);
    }).catch(e =>{
        console.log(`Seed error ${e}`);
    });
}

/** using express json middleware */
app.use(express.json());

app.use("/api/v1/user", userController);

var port = process.env.PORT || '3000';

app.listen(port, ()=>{
    console.log(`listening  http://localhost:${port}`);
});