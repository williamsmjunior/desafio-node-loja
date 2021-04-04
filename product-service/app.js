/**
 * Product Service rest API
 * @module app.js
 */

const express = require("express");
const app = express();
const productController = require("./lib/product.controller");

/** using express json middleware */
app.use(express.json());

app.use("/", productController);

var port = process.env.PORT || '3001';

app.listen(port, ()=>{
    console.log(`listening  http://localhost:${port}`);
});