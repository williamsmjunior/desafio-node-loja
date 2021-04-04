/**
 * This module runs the user api tests
 * @module test/user.spec.js
 */

var axios = require("axios");
var permissions = require("../lib/permissions");
var chai = require("chai");
var expect = chai.expect;

const baseURL = process.env.BASE_URL || 'http://localhost:3000'

var api = axios.create({
    baseURL : baseURL
});


describe("user-api", function(){
    let adminHeaders = {};
    before(async function(){
        let credentials = {
            username : "admin",
            password : "password#123"
        };
        let response = await api.post("/auth", credentials);
        expect(response.status).to.be.equal(200);
        let adminToken = response.data.token;
        adminHeaders.authorization = `Bearer ${adminToken}`;
    });
    
    let user;
    describe("POST /", function(){
        it("Should create some user with permissions", async function(){
            user = {
                username : `user-${Date.now()}`,
                password : `password#123`,
                permissions : [permissions.MANAGE_PRODUCTS]
            }

            let response = await api.post("/", user, {headers:adminHeaders});
            expect(response.status).to.be.equals(201);
            
            let createdUser = response.data;
            expect(createdUser).have.keys(["_id", "username", "permissions"]);
            expect(createdUser.username).to.be.equals(user.username);
            expect(createdUser.permissions).to.be.eqls(user.permissions);

        });

        it("should not allow to create repeated user", async function(){

        });
    });

    describe("POST /auth", function(){
        it("Should return the user token", async function(){
            let credentials = {
                username : user.username,
                password : user.password
            };
            let response = await api.post("/auth", credentials);
            expect(response.status).to.be.equal(200);
            expect(response.data).have.key("token");
        });
    });
});