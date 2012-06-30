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
var selection = -1;
$('#state').text("Waiting for next round to start");

var App = {

  state: 'main_menu',

  init: function(){
    App.name_pick();
  },

  name_pick: function(){
    my_name = '';
    while(my_name == null || my_name == ''){
      my_name = prompt("What's your name?");
    }
    socket.emit('join', my_name, function(success){
      if(!success){
        alert("Name taken!");
        App.name_pick();
      } else {
        App.render();
      }
    });
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
    if (selection === 0){
      $('#right img').removeClass('border');
      $('#left img').addClass('border');
    } else if (selection === 1) {
      $('#right img').addClass('border');
      $('#left img').removeClass('border');
    } else {
      $('#right img').removeClass('border');
      $('#left img').removeClass('border');
    }
  }
};

socket.on('announce_players', function(p) {
  players = p;
  App.render();
});

function left(){
  selection = 0;
  select();
  App.render();
}
function right(){
  selection = 1;
  select();
  App.render();
}
function select(){
  socket.emit('play', my_name, selection);
}

socket.on('outcome', function(data) {
  var state = '';
  if(data.you === 1){
    state = "You win! Choose again!";
  } else if(data.you === 2){
    state = "Draw. Choose again!";
  } else if (data.you === 0) {
    state = "You lose. Choose again!";
  } else if (data.you === -1) {
    state = "Choose the less popular image!";
  }
  state += ' Previous round -- left: ' + data.counts[0] + ' right: ' + data.counts[1];
  selection = -1;
  $('#state').text(state);
  $('#left img').attr('src', data.new_images[0]);
  $('#right img').attr('src', data.new_images[1]);
  played = false;
  App.render();
});

$(function(){
  App.init();
});
