$(document).ready(function() {

    // Create SocketIO instance
    var server = io.connect('http://localhost:3000');

    //Append messages to an chat
    server.on('messages', function(data) {
        $('.text-chat').append(data.results);
    });

    //Send a message to the server
    $('#messageForm').on("submit", function(event){
        var content = $('#contentMessage').val();
        server.emit('messages', {'results': content});

        event.preventDefault();
    });

})