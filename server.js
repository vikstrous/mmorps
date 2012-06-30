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

var all_images_str = 'http://imgur.com/r/pics/HXupz.png,http://i.imgur.com/6hfhmb.jpg,http://i.imgur.com/Pgu7bb.jpg,http://i.imgur.com/rjhkob.jpg,http://i.imgur.com/NGkmXb.jpg,http://i.imgur.com/mCy1lb.jpg,http://i.imgur.com/MCckqb.jpg,http://i.imgur.com/7dCuBb.jpg,http://i.imgur.com/EIPFzb.jpg,http://i.imgur.com/UoZPK.jpg,http://i.imgur.com/FSjwsb.jpg,http://i.imgur.com/F08i0b.jpg,http://i.imgur.com/mppayb.jpg,http://i.imgur.com/EOCmnb.jpg,http://i.imgur.com/pbIJ8b.jpg,http://i.imgur.com/NHdxab.jpg,http://i.imgur.com/wnkzQb.jpg,http://i.imgur.com/WdC8bb.jpg,http://i.imgur.com/XGJIWb.jpg,http://i.imgur.com/aNbhdb.jpg,http://i.imgur.com/BCM62b.jpg,http://i.imgur.com/t8XlSb.jpg,http://i.imgur.com/u5bD0b.jpg,http://i.imgur.com/STRI0b.jpg,http://i.imgur.com/f4ZUab.jpg,http://i.imgur.com/ikqE2b.jpg,http://i.imgur.com/tOjjTb.jpg,http://i.imgur.com/nBjjIb.jpg,http://i.imgur.com/PMwbCb.jpg,http://i.imgur.com/AHs3Yb.jpg,http://i.imgur.com/ABjV6b.jpg,http://i.imgur.com/XQLXbb.jpg,http://i.imgur.com/i6Z0Qb.jpg,http://i.imgur.com/bjRNfb.jpg,http://i.imgur.com/Q0WQeb.jpg,http://i.imgur.com/sRsZPb.jpg,http://i.imgur.com/O2znUb.jpg,http://i.imgur.com/BUyyEb.jpg,http://i.imgur.com/nvnkSb.jpg,http://i.imgur.com/z0LdWb.jpg,http://i.imgur.com/Z42bhb.jpg,http://i.imgur.com/2sQT9b.jpg';
var all_images = all_images_str.split(',');

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

  var left_img = Math.floor( Math.random() * (all_images.length - 1));
  var right_img = left_img;
  while(left_img === right_img){
    right_img = Math.floor( Math.random() * (all_images.length - 1));
  }
  var new_images = [all_images[left_img], all_images[right_img]];

  for(key in players){
    if(winner == 2)
      sockets[key].emit('outcome', {you:2, counts: [tally_l, tally_r], new_images: new_images});//0 for loss, 1 for win, -1 for no result / didn't play
    else if (players[key] === -1)
      sockets[key].emit('outcome', {you:-1, counts: [tally_l, tally_r], new_images: new_images});//0 for loss, 1 for win, -1 for no result / didn't play
    else if (players[key] !== winner)
      sockets[key].emit('outcome', {you:1, counts: [tally_l, tally_r], new_images: new_images});//0 for loss, 1 for win, -1 for no result / didn't play
    else if (players[key] === winner)
      sockets[key].emit('outcome', {you:0, counts: [tally_l, tally_r], new_images: new_images});//0 for loss, 1 for win, -1 for no result / didn't play
  }
  for(key in players){
    players[key] = -1;
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