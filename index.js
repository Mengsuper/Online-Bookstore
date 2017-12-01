var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(require('body-parser').json());   // add body-parser dependency


// connect to mongo database (local database cpen400A)
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var url = 'mongodb://localhost:27017/cpen400A';


// authentication
var auth = function(req, res, next) {
    
    var tokenFromAjax = req.query.token;

    if (tokenFromAjax) {
        const connection = MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log(err);
            } else { 
                var query = {token: tokenFromAjax};  
                db.collection("users").findOne(query, function(err, docs) { 
                    if (err) throw err; 
                    else if (docs == null ) return res.status(401).send('Unauthenticated request');
                    else return next();
                    db.close(); 
                });
            }
        });
    }
};


// products endpoint (with filters/category)
app.get('/products', auth, function(request, response) {   

    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var products = {};

    // connect to database 
    const connection = MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log(err);
        } else { 

            var query = {};
            var lowPriceReq = request.query.lowprice;
            var highPriceReq = request.query.highprice;
            var category = request.query.category;

            // check if lowPriceReq and highPriceReq are empty strings
            if (lowPriceReq !== '' && highPriceReq !== '') {

                var lowPrice = parseInt(lowPriceReq), highPrice = parseInt(highPriceReq);

                if (lowPrice <= highPrice) {  // lowPrice is lower or equal to highPrice

                    query = {price: {$gte: lowPrice, $lte: highPrice}, category: category};

                } else {
                    console.log("Please enter valid price filter");  // invalid filters
                    response.status(400).send(); 
                    return;
                }

            } else if (lowPriceReq === '' && highPriceReq !== '') {

                query = {price: {$gte: 0, $lte: highPrice}, category: category};

            } else if (lowPriceReq !== '' && highPriceReq === '') {

                console.log("please enter a high price"); 
                response.status(400).send();
                return;
            } 


            // fetch products based on filters
            db.collection("products").find(query).toArray(function(err, docs) {
                if (err) throw err; 
                else {
                    response.status(200).send(docs);
                    products = docs;
                }
                db.close(); 
            });
        } 
  });

  return products;

})


// checkout endpoint
app.post('/checkout/', auth, function(request, response) {        

  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // authentication (use auth function defined above)
  //auth(request, response, callbackFunc);


  // connect to database
  const connection = MongoClient.connect(url, function(err, db) {
      if (err) {
          console.log(err);
      } else { 

          var productsUpdated = {}; 

          // insert/update checkout info to order   // insert or update ???
          var cart = request.body.cart, total = request.body.total; 

          db.collection("orders").insertOne({cart: cart, total: total}, function(err, docs) {
              if (err) throw err; 
          });

          // update products  (check if the item are empty when )
          for (var item in cart) {

              db.collection("products").update({name: item}, {$inc: {quantity: -cart[item]}}, function(err, docs) {

                  if (err) throw err; 
                  else {
                      productsUpdated[item] = db.collection("products").find({name: item}, function(err, docs) {
                          if (err) throw err;
                      });
                  }
                  
              });
          }

          response.status(200).send(productsUpdated); 
          db.close();
      } 

  });

})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
