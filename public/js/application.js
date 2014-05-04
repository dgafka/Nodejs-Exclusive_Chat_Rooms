// Create SocketIO instance
var server = io.connect('http://localhost:3000');


server.on('messages', function(data) {
    $('.text-chat').append(data.hello);
})
