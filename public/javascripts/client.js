$(function() {
    
  var userName = '';

  var socket = io.connect('/');
  
  var Client = {
      init: function() {
          //判断是否有用户名，在localStorage中存储的
           var savedUsername = localStorage.getItem('username'); 
           if (savedUsername) {
               userName = savedUsername;
               $('#username').val(userName);
               $('#words').focus();
           } else {
               $('#myModal').modal();
               $('#initUsername').focus();
           }
      },
      
      bindEvent: function() {
          var me = this;
          socket.on('show', me.showHandler);
          
          //发送消息监听
          $('#send').click(function(e) {
              e.preventDefault();
              if ($('#words').val() == '') {
                  return;
              }
              socket.emit('update', {
                  'username' : userName,
                  'words' : $('#words').val()
              });
          });
          
          //注册用户名监听
          $('#confirmUsername').click(function(e) {
              e.preventDefault();
              if ($('#initUsername').val() == '') {
                  return;
              }
              socket.on('checked', me.checkHandler);
              socket.emit('check', {
                  'username' : $('#initUsername').val()
              });
          });
          
      },
      
      checkHandler: function(data) {
          if (data.status == 0) {
              userName = $('#initUsername').val();
              $('#username').val(userName);
              $('#myModal').modal('hide');
              $('#words').focus();
              localStorage.setItem('username', userName);
          } else {
              alert('Username occupied! please try another one!');
          }
      },
      
      showHandler: function(data) {
          if (data.status == 0 && data.newWords) {
              $('#words').val('');
              for (var i = 0, l = data.newWords.length; i < l; i++) {
                  $('#ears').append('<div>' + data.newWords[i].userName + ': ' + data.newWords[i].words + '</div>');
              }
              $('#ears').scrollTop($('#ears').prop('scrollHeight'));
          }
      }
  };
  
  Client.init();
  Client.bindEvent();
  
});
