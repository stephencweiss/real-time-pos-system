var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var Datastore = require('nedb');

var app = express();
var server = http.Server(app);

var Inventory = require('./inventory');

module.exports = app;

// Create database
var Transactions = new Datastore({
  filename: './server/databases/transactions.db',
  autoload: true
})

app.get('/', function(req, res){
  res.send('Transactions API')
})
