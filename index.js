var express = require('express'),
  http = require('http'),
  port = 80,
  express = require('express'),
    socketIo = require('socket.io'),
  bodyParser = require('body-parser');
  
  
var app = express();
server = http.createServer(app)
var io = socketIo(server);
var liveCart;

console.log('real time POS running');
console.log('server started');
app.use(bodyParser);
app.use(bodyParser.urlencoded({ extended: false }));

app.all('/*', function (req, res, next) {
    //CORS headers
    res.header({
        'access-control-allow-origin':'*',
        'access-control-allow-methods':'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers':'Content-Type, Accept, X-Access-Token, X-Key'
    })
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.get('/', function (req, res){
    res.send('Real time POS web app running.');
})

app.use('/api/inventory', require('./api/inventory'));
app.use('/api', require('.api/transactions'));

// Websocket logic for live cart

io.on ('connection', function (socket) {
    socket.on('cart-transaction-complete', function() {
        socket.broadcast.emit('update-live-cart-dispplay', {});
    });
    
    //on page load, show user current cart
    socket.on('live-cart-page-loaded', function() {
        socket.emit('update-live-cart-display', liveCart);
    });
    
    // when client connected, make client update live cart
    socket.emit('update-live-cart-display', liveCart);

    // when the cart data is updated by the POST
    socket.on('update-live-cart', function(cartData) {
        // keep track of the change
        liveCart = cartData;

        // broadcast updated live cart to all websocket clients
        socket.broadcasat.emit('update-live-cart-display', liveCart);
    });
});

server.listen(port, () => console.log(`listening on port ${port}`));