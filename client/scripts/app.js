// YOUR CODE HERE:
var app = {
  server: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
  roomname: 'lobby',
  messages: null,
  friends: {}
};


// app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';

app.init = function() {
  app.fetch();
  app.handleUsernameClick();
  app.handleSubmit();
  app.addRoom();
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log('chatterbox: Message sent');
    },
    error: function(data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });

};

app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: 'order=-createdAt',
    success: function(data) {
      console.log('chatterbox: Messages received!');
      var rooms = {};
      data.results.forEach(function(result) {
        result.roomname = $.trim($('<div/>').text(result.roomname).html());
      });
      app.messages = data.results;
      data.results.forEach(function(result) {
        if (result.username && result.text) {
          app.renderMessage(result);
        }
        var roomName = $.trim($('<div/>').text(result.roomname).html());
        if (!rooms[roomName]) {
          if (roomName) {
            rooms[roomName] = true;
            app.renderRoom(roomName);
          }
        }
      });
    },
    error: function(data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message', data);
    }
  });

};

app.clearMessages = function(flag) {
  $('#chats').empty();
  if (flag) {
    $('#roomSelect').children().remove().end();
  }
};

app.renderMessage = function(message) {
  var username = $('<div/>').text(message.username).html();
  $('#chats').append("<div class='container'><span class='user'>" + $('<div/>').text(message.username).html() + "</span>:<br> <span class='messageText'>" + $('<div/>').text(message.text).html() + "</span></div>");
};

app.renderRoom = function(roomname) {
  // room is now a <p> element inside the #roomSelect div
  // room should be an item of a select drop down
  var room = '<option>' + $.trim($('<div/>').text(roomname).html()) + '</option>';
  $('#roomSelect').append(room);
};

app.handleUsernameClick = function() {
  $(document).on('click', '.user', function(e) {
    var friend = e.currentTarget.innerText;
    $('.user').each(function() {
      if (this.innerText === friend) {
        $(this).next().next().toggleClass('friend');
      }
    });
  });
};

app.handleSubmit = function() {
  $("#submit").on("click", function(e) {
    e.preventDefault();
    var message = {
      username: window.location.search.split('=')[1],
      text: $('#input').val(),
      roomname: $('#roomSelect option:selected').text()
    };
    console.log(message);
    app.send(message);
    app.clearMessages(true);
    app.fetch();
  });
};

app.addRoom = function() {
  $("#newRoom").click(function() {
    var roomName = prompt("Room Name:");
    if (roomName) {
      app.renderRoom(roomName);
    }
  });
};

$(document).ready(function() {
  app.init();
  $('#roomSelect').on("change", function(e) {
    var roomName = e.currentTarget.value;
    app.clearMessages(false);
    for (var i = 0; i < app.messages.length; i++) {
      if (roomName === app.messages[i].roomname) {
        app.renderMessage(app.messages[i]);
      }
    }
  });
});
