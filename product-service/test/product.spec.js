/**
 * This module runs the user api tests
 * @module test/user.spec.js
 */

var axios = require("axios");
var permissions = require("../lib/permissions");
var chai = require("chai");
var expect = chai.expect;

const baseURL = process.env.BASE_URL || 'http://localhost:3001'

const userBaseURL = process.env.USER_BASE_URL || 'http://localhost:3000'
var userApi = axios.create({
    baseURL : userBaseURL
});

var api = axios.create({
    baseURL : baseURL
});

let userHeaders = {};

before(async function(){
    //lets first login as admin before the tests
    let credentials = {
        username : "admin",
        password : "password#123"
    };
    let response = await userApi.post("/auth", credentials);
    expect(response.status).to.be.equal(200);
    
    let adminToken = response.data.token;
    userHeaders.authorization = `Bearer ${adminToken}`;

});

describe("product-api", function(){
    let products = [];
    describe("POST /", function(){
        it("Should not accept unauthenticated users", async function(){
            let product = {
                name: "Some Box",
                price : 5.40,
                available : true,
                description : "Amazing some box"
            };

            let response;
            try{
                response = await api.post("/", product);
                expect(response.status).to.be.equals(401);
            } catch(e){
                expect(e.response.status).to.be.equals(401);
            }
        });

        it("Should create a product as authorized user", async function(){
            let product = {
                name: "Some Box v2",
                price : 5.40,
                available : true,
                description : "Amazing some box. version 2"
            };

            let response;
            try{
                response = await api.post("/", product, {headers: userHeaders});
            } catch(e){
                expect(e.response.status).to.be.equals(201);
            }

            expect(response.status).to.be.equals(201);
            let newProduct = response.data;
            expect(newProduct).have.keys(["name", "price", "created", "available", "description", "_id"]);
            product._id = newProduct._id;
            product.created = newProduct.created;
            expect(newProduct).to.be.eqls(product);

            products.push(newProduct);
        });

        it("Should not create the product if the user has no MANAGE_PRODUCT permission", async function(){
            let user = {
                username: `user-${Date.now()}`,
                password : "password#123"
            };
            await userApi.post("/", user, {headers: userHeaders});

            let loginResponse = await userApi.post("/auth", user);
            let newUserHeaders ={
                authorization : `Bearer ${loginResponse.data.token}`
            }

            let product = {
                name: "Some Box v3",
                price : 5.40,
                available : true,
                description : "Amazing some box. version 3"
            };

            let response;
            try{
                response = await api.post("/", product, {headers: newUserHeaders});
                expect(response.status).to.be.equals(403);
            } catch(e){
                expect(e.response.status).to.be.equals(403);
            }
        });
    });

    describe("GET /", function(){

        before(async function(){
            this.timeout = 20000;
            for(let i = 0; i < 100; i++){
                let product = {
                    name: `Some Box v4${i}`,
                    price : 5.40,
                    available : true,
                    description : `Amazing some box. version 4${i}`
                };
    
                let response;
                try{
                    response = await api.post("/", product, {headers: userHeaders});
                } catch(e){
                    expect(e.response.status).to.be.equals(201);
                }
                expect(response.status).to.be.equals(201);
                let newProduct = response.data;
                product._id = newProduct._id;
                product.created = newProduct.created;
                products.push(newProduct);
            }
        });

        it("Should return 20 products when get without params", async function(){
            let response;
            try{
                response = await api.get("/");
            } catch(e){
                console.log(e.response.data);
                expect(e.response.status).to.be.equals(200);
            }
            expect(response.status).to.be.equals(200);
            let result = response.data;
            expect(result.data.length).to.be.equals(20);
            expect(result.count).to.be.equals(products.length);

            let expectedProducts = products.slice(0,20);
            expect(result.data).to.be.eqls(expectedProducts);
        });

        it("Should paginate properly", async function(){
            let response;
            try{
                response = await api.get("/?skip=5&limit=30");
            } catch(e){
                console.log(e.response.data);
                expect(e.response.status).to.be.equals(200);
            }
            expect(response.status).to.be.equals(200);
            let result = response.data;
            expect(result.data.length).to.be.equals(30);
            expect(result.count).to.be.equals(products.length);

            let expectedProducts = products.slice(5,35);
            expect(result.data).to.be.eqls(expectedProducts);
        });

        it("should filter (search) products properly", async function(){
            let response;
            try{
                response = await api.get("/?q=44");
            } catch(e){
                console.log(e.response.data);
                expect(e.response.status).to.be.equals(200);
            }

            let expectedArray = products.filter((value)=>{
                return value.name.includes("44") || value.description.includes("44")
            });

            expect(response.status).to.be.equals(200);
            let result = response.data;
            expect(result.data.length).to.be.equals(expectedArray.length);
            expect(result.data).to.be.eqls(expectedArray);
        });
    });

    describe("GET /:id", function(){
        it("Should return the product properly", async function(){
            let selected = products[3];
            let response;
            try{
                response = await api.get(`/${selected._id}`);
            } catch(e){
                expect(e.response.status).to.be.equals(200);
            }
            expect(response.status).to.be.equals(200);
            expect(response.data).to.be.eqls(selected);
        });
    });

    describe("UPDATE /:id", function(){
        it("Should return the product properly", async function(){
            let selected = products[3];
            selected.name += "n-EDITED";
            selected.description += "EDITED";
            let response;
            try{
                response = await api.put(`/${selected._id}`, selected, {headers:userHeaders});
            } catch(e){
                expect(e.response.status).to.be.equals(200);
            }
            expect(response.status).to.be.equals(200);
            expect(response.data).to.be.eqls(selected);
        });

        it("should not update if user is unautorized", async function(){
            let selected = products[3];
            let newProduct = {
                _id : selected._id,
                name: selected.name + "no EDIT",
                description : selected.description,
                price : selected.price,
                created : selected.created
            }
            let response;
            try{
                response = await api.put(`/${selected._id}`, newProduct);
            } catch(e){
                expect(e.response.status).to.be.equals(401);
            }
            expect(response).to.be.equals(undefined);

            //Verify that the product was not modified
            try{
                response = await api.get(`/${selected._id}`);
            } catch(e){
                expect(e.response.status).to.be.equals(200);
            }
            expect(response.status).to.be.equals(200);
            expect(response.data).to.be.eqls(selected);
        });
    });

    describe("DELETE /:id", function(){
        it("should not allow to delete if the user is not authorized", async function(){
            let response;
            try{
                response = await api.delete(`/${products[0]._id}`);
            } catch(e){
                expect(e.response.status).to.be.equals(401);
            }
            expect(response).to.be.equals(undefined);
        });

        it("should delete if the user is authorized", async function(){
            let response;
            try{
                response = await api.delete(`/${products[0]._id}`, {headers:userHeaders});
            } catch(e){
                expect(e.response.status).to.be.equals(200);
            }
            expect(response.status).to.be.equals(200);
        });

        it("should return 404 if product does not exits", async function(){
            let response;
            try{
                response = await api.delete(`/${products[0]._id}`, {headers:userHeaders});
            } catch(e){
                expect(e.response.status).to.be.equals(404);
            }
            expect(response).to.be.equals(undefined);
        });
    });

    after(async function(){
        this.timeout = 20000;
        for(let product of products){
            try{
                await api.delete(`/${product._id}`, {headers:userHeaders});
            } catch(e){
            }
        }
    })
});