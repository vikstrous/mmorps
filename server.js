var express = require('express'),
    stylus = require('stylus'),
   io = require('socket.io');

var app = express.createServer();

app.configure(function(){
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({secret: 'fsdhg9tru349t58u4',
        key: 'express.sid'}));
  app.use(express.bodyParser());
  app.use(express.router(require(__dirname + '/router/router.js')));
  app.use(stylus.middleware(
    { src: __dirname + '/stylus',
      dest: __dirname + '/public'}
  ));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.logger());
});

var port = process.env.NODE_PORT || 3000;

app.listen(port, function() {
  console.log("Listening on " + port);
});

var sio = io.listen(app);

sio.sockets.on('connection', onconnect);


//name:data hash map
var players = {};
var sockets = {};

var interval = setInterval(tick, 15000);

function tick() {
  var tally_l = 0;
  var tally_r = 0;
  for(var key in players){
    if ( players[key] === 0){
      tally_l += 1;
    } else if (players[key] === 1){
      tally_r += 1;
    }
  }
  var winner;
  if (tally_l == tally_r)
    winner = 2;
  if (tally_l > tally_r)
    winner = 0;
  if (tally_l < tally_r)
    winner = 1;
  for(key in players){
    if(winner == 2)
      sockets[key].emit('outcome', {you:2, counts: [tally_l, tally_r]});//0 for loss, 1 for win, -1 for no result / didn't play
    else if (players[key] === -1)
      sockets[key].emit('outcome', {you:-1, counts: [tally_l, tally_r]});//0 for loss, 1 for win, -1 for no result / didn't play
    else if (players[key] === winner)
      sockets[key].emit('outcome', {you:1, counts: [tally_l, tally_r]});//0 for loss, 1 for win, -1 for no result / didn't play
    else if (players[key] !== winner)
      sockets[key].emit('outcome', {you:0, counts: [tally_l, tally_r]});//0 for loss, 1 for win, -1 for no result / didn't play
  }
}

function onconnect(socket) {
  socket.on('join', function(name) {
    players[name] = -1;
    sockets[name] = socket;
    socket.name = name;
    sio.sockets.emit('announce_players', players);
  });
  socket.on('play', function(name, value) {
    players[name] = value;
  });
  socket.on('disconnect', function() {
      delete players[socket.name];
      delete sockets[socket.name];
  });

}