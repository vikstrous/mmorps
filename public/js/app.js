var socket = io.connect();
var games_list = [];
var page_loading_counter = 0;

function page_is_loading(state) {
  if (state) {
    page_loading_counter += 1;
  } else {
    page_loading_counter -= 1;
  }
  if (page_loading_counter <= 0) {
    $('#overlay').hide();
  } else {
    $('#overlay').show();
  }
}

var players = {};
var my_name = "anon";
var played = true;
$('#state').text("Waiting for next round to start");

var App = {

  state: 'main_menu',

  init: function(){
    my_name = prompt("What's your name?");
    socket.emit('join', my_name);
    App.render();
  },

  render: function(){
    $('#name').text(my_name);
    var p = '';
    for(var i in players){
      p += i + ', ';
    }
    $('#players').text(p);
    if(played){
      $('#buttons').hide();
    } else {
      $('#buttons').show();
    }
  }
};

socket.on('announce_players', function(p) {
  players = p;
  App.render();
});

function left(){
  select(0);
}
function right(){
  select(1);
}
function select(which){
  if (which === 0){
    $('#right').removeClass('border');
    $('#left').addClass('border');
  } else {
    $('#right').addClass('border');
    $('#left').removeClass('border');
  }
  socket.emit('play', my_name, which);
}

socket.on('outcome', function(data) {
  if(data.you === 1){
    $('#state').text("You win! Choose again!");
  } else if(data.you === 2){
    $('#state').text("Draw. Choose again!");
  } else if (data.you === 0) {
    $('#state').text("You lose. Choose again!");
  } else if (data.you === -1) {
    $('#state').text("Choose the less popular image!");
  }
  played = false;
  App.render();
});

$(function(){
  App.init();
});
