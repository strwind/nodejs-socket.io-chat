
/**
 * by @劲风FEI
 * Module dependencies.
 */

var express = require('express')
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
//这个项目中，express的唯一用处是设置静态根目录，然后进行socket.io通信

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// socket.io
var io = require('socket.io').listen(server);
var timeline = [];
//每隔半小时清理一次历史记录
setInterval(function(){ timeline = [];}, 1000*60*30);
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
      //io.sockets.emit  向所有客户端都 发送消息，触发 'show' 事件，  等价于下面两种情况之和
      //socket.broadcast.emit  向除了自己之外的客户端发送  
      //socket.emit  向自己发送   
      io.sockets.emit('show', {
        'status' : 0,
        'newWords' : [newWords]
      });
    }
  });
  
  var historys = [];
  for (var i = timeline.length - 1; i >= 0; i--) {
      historys.unshift({
        'userName' : timeline[i].userName,
        'words' : timeline[i].words
      });
  }
  //新聊天室打开时，能看到当天的历史聊天记录，只向自己发送
  socket.emit('show', {
    'status' : 0,
    'newWords' : historys
  });
  
  //检查当前用户名是否已经注册操作
  socket.on('check', function (data) {
    var userName = data.username;
    if (!userNames[userName]) {
      userNames[userName] = true;
      socket.emit('checked', {status : 0});
    } else {
      socket.emit('checked', {status : 1});
    }
  });
});
