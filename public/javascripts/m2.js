$(function() {
  const SERVER = 'http://cq01-sdc-ma01.vm.baidu.com:8080/';

  var userName = '';

  var socket = io.connect('/');

  var updateHandler = function(data) {
    if (data.status == 0 && data.newWords) {
      $('#words').val('');
      for (var i = 0, l = data.newWords.length; i < l; i++) {
        console.log(data);
        $('#ears').append('<div>' + data.newWords[i].userName + ': ' + data.newWords[i].words + '</div>');
      }
      $('#ears').scrollTop($('#ears').prop('scrollHeight'));
    }
  };

  $('#mouth').submit(function(e) {
    e.preventDefault();
    if ($('#words').val() == '') {
      return;
    }

    socket.emit('update', {
      'username' : userName,
      'words' : $('#words').val()
    });
  });

  var checkHandler = function(data) {
    if (data.status == 0) {
      userName = $('#initUsername').val();
      $('#username').val(userName);
      $('#myModal').modal('hide');
      $('#words').focus();
      localStorage.setItem('username', userName);
    } else {
      alert('Username occupied! please try another one!');
    }
  };

  $('#init').submit(function(e) {
    e.preventDefault();
    if ($('#initUsername').val() == '') {
      return;
    }

    socket.emit('check', {
      'username' : $('#initUsername').val()
    });

    socket.on('checked', checkHandler);
  });

  $('#confirmUsername').click(function(e) {
    $('#init').submit();
    e.preventDefault();
  });

  var savedUsername = localStorage.getItem('username'); 
  if (savedUsername) {
    userName = savedUsername;
    $('#username').val(userName);
    $('#words').focus();
  } else {
    $('#myModal').modal();
    $('#initUsername').focus();
  }

  socket.on('updated', updateHandler);
});
