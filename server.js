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
players = {};

function onconnect(socket) {
  socket.on('join', function(name, cb) {
    players[name] = {};
    sio.sockets.emit('announce_players', players);
    // if(typeof cb == 'function') cb(players);
  });
}