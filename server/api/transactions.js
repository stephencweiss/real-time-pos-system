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
});

app.get('/', function(req, res) {
  res.send('Transactions API')
});

//GET all transactions
app.get('/all', function(req, res) {
  //nedb.find(query, callback)
  Transactions.find({}, function (err, transactions) {
    if (err) res.status(500).send();
    else res.status(201).send(transactions) 
  });
});

//GET limited transactions
app.get('/limit', function (req, res) {
  var limit = parseInt(req.query.limit, 10) || 5
  Transactions.find({}, function (err) {
    if (err) res.status(500).send();
  })
    .sort({ date : -1 })
    .exec(function (err, transactions) {
      if (err) res.status(500).send();
      else res.status(201).send(transactions) 
    })
});

//GET total sales for current day
app.get('/day-total', function (req, res) {
  // if day is provided
  var date = setDate(req.query.date);
  
})

function setDate(date){
  var returnDate = {};
  returnDate.startDate = date ? new Date(date) : new Date();
  returnDate.endDate = date ? new Date(date) : new Date();
  returnDate.startDate.setHours(0,0,0,0)
  returnDate.endDate.setHours(23,59,59,59)
  return returnDate;
}