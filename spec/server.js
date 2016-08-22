if (!module.parent) {
  var fs = require('fs')
      , http = require('http')
      , socketio = require('socket.io');
  
  var server = http.createServer(function(req, res) {
      res.writeHead(200, { 'Content-type': 'text/html'});
      res.end(fs.readFileSync(__dirname + '/index.html'));
  }).listen(44501, function() {
      console.log('Listening at: http://localhost:44501');
  });
  
  socketio.listen(server).on('connection', function (socket) {
    console.log('Socket connected');
    socket.on('LOGIN_ATTEMPT', function(user) {
      socket.emit('LOGIN_SUCCESS', user);
    });
  });
}
