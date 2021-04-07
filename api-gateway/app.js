const httpProxy = require('express-http-proxy');
const express = require('express');
const app = express();

let port = process.env.PORT || 3002;
let userService = process.env.USER_SERVICE_URL || 'http://localhost:3000/api/v1/user';
let productService = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001/api/v1/product';
 
function selectProxyHost(req) {
    if (req.path.startsWith('/api/v1/user')){
        return userService;
    } else if (req.path.startsWith('/api/v1/product')){
        return productService;
    }
    return null;
}
 
app.use((req, res, next) => {
    let host = selectProxyHost(req);
    if(host != null){
        httpProxy(selectProxyHost(req))(req, res, next);
    } else {
        res.status(200).send("ok");
    }
});

app.listen(port, () => {
    console.log('API Gateway running!');
});