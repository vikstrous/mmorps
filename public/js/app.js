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
  }
};

socket.on('announce_players', function(p) {
  players = p;
  App.render();
});

$(function(){
  App.init();
});
