var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var Datastore = require('nedb');

var app = express();
var server = http.Server(app);

var Inventory = require('./inventory');

module.exports = app;

// Helper functions
function setDate(date){
  var returnDate = {};
  returnDate.startDate = date ? new Date(date) : new Date();
  returnDate.endDate = date ? new Date(date) : new Date();
  returnDate.startDate.setHours(0,0,0,0)
  returnDate.endDate.setHours(23,59,59,59)
  return returnDate;
}

// Create database
var Transactions = new Datastore({
  filename: './server/databases/transactions.db',
  autoload: true
});

app.get('/', function(req, res) {
  res.send('Transactions API')
});

// GET all transactions
app.get('/all', function(req, res) {
  //nedb.find(query, callback)
  Transactions.find({}, function (err, transactions) {
    if (err) res.status(500).send(err);
    else res.status(201).send(transactions) 
  });
});

// GET limited transactions
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

// GET total sales for current day
app.get('/day-total', function (req, res) {
  // if day is provided
  var searchDate = setDate(req.query.date);
  //nedb.find(query, callback)
  Transactions.find(
    {date: { 
      $gte : searchDate.startDate.toJSON(), 
      $lte : searchDate.endDate.toJSON()
    }}, function (err, transactions) {
      if (err) res.status(500).send(err);
      else{
        var result = { date : searchDate.startDate};
        if (transactions) {
          var total = transactions.reduce((total, current) => {return total + current}, 0.00);
          result.total = parseFloat(parseFloat(total).toFixed(2));
        } else {
          result.total = 0;
        }
        res.status(200).send(result);
      }
    }
  )
})

// GET transactions for a particular date
app.get('/by-date', function (req, res) {
  var searchDate = setDate(req.query.date)
  Transactions.find( 
    { date: { 
    $gte : searchDate.startDate.toJSON(), 
    $lte : searchDate.endDate.toJSON()
    }}, function (err, transactions) {
      if (err) res.status(500).send(err);
      else {
        if (transactions) {
          res.status(200).send(transactions);
        }
      }
    }
  );
})

// Add a new transaction
app.post('/new', function (req, res) {
  var newTransaction = req.body;
  //nedB.insert(doc, callback)
  Transactions.insert(newTransaction, function (err, transaction) {
    if (err) res.status(500).send(err);
    else {
      res.status(200).sendDate();
      Inventory.decrementInventory(transaction.products);
    }
  });
})
