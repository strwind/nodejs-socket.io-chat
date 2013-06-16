
/**
 * by @firedfox
 * Module dependencies.
 */

var express = require('express')
  //, routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//app.get('/', routes.index0);
//app.get('/check', routes.check);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// socket.io
var io = require('socket.io').listen(server);

var events = require('events');
var emitter = new events.EventEmitter();
emitter.setMaxListeners(100);

var timeline = [];
var userNames = {};

io.sockets.on('connection', function (socket) {
  socket.on('update', function (data) {
    var userName = data.username;
    var words = data.words;
    if (userName) {
      var newWords = {
        'userName' : userName,
        'words' : words
      };
      timeline.push(newWords);
      emitter.emit('show', {
        'status' : 0,
        'newWords' : [newWords]
      });
    }
  });

  emitter.on('show', function(data) {
    socket.emit('show', data);
  });

  socket.on('check', function (data) {
    var userName = data.username;
    if (!userNames[userName]) {
      userNames[userName] = true;
      socket.emit('checked', {status : 0});
    } else {
      socket.emit('checked', {status : 1});
    }
  });

  // init
  var allWords = [];
  for (var i = timeline.length - 1; i >= 0; i--) {
      allWords.unshift({
        'userName' : timeline[i].userName,
        'words' : timeline[i].words
      });
  }
  emitter.emit('show', {
    'status' : 0,
    'allWords' : allWords
  });

});
