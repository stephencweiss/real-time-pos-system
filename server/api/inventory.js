var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var Datastore = require('nedb');

var app = express();
var server = http.Server(app);

app.use(bodyParser.json());

module.exports = app;


// Create Database
var inventoryDB = new Datastore( {
  filename: './server/databases/inventory.db',
  autoload: true
});

// GET inventory
app.get('/', function (req, res) {
  res.send('inventory API')
})

// GET a product from inventory by _id
app.get('/product/:productID', function(req, res) {
  if (!req.params.productId) {
    res.status(500).send('ID field required.');
  } else {
    inventoryDB.findOne({ _id: req.params.productId}, function (err, product){
      res.send(product)
    });
  }
})

// GET all inventory products
app.get('/products', function (req, res) {
  inventoryDB.find({}, function (err, products) {
    console.log(`sending all products`);
    res.send(products);
  })
})

// Create an inventory product
app.post('/products', function(req, res) {
  var newProduct = req.body;
  inventoryDB.insert(newProduct , function (err, product){
    if(err) res.status(500).send(err);
    else res.send(product)
  });
})

// Delete an inventory product?
app.delete('/product/:productId', function (req, res){
  inventoryDB.remove({ _id: req.params.productId }, function (err, numRemoved){
    if (err) res.status(500).send(err);
    else res.status(200).send();
  });
})

// Updates Inventory product
