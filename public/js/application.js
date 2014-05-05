$(document).ready(function() {

    // Create SocketIO instance
    var server = io.connect('http://localhost:3000');

    //Recive message and appends message to chat
    server.on('messages', function(data) {
        //escape js and html
        $('.text-chat').append($('<div></div>').text(data.results));
    });

    //Send a message to the server
    $('#messageForm').on("submit", function(event){
        //Manipulate data
        var content = $(this).children('#contentMessage').val();
        $(this).parent().parent().children('.text-chat').append(content + "<br/>");
        $(this).children('#contentMessage').val('')

        //Emits a message to an server.
        server.emit('messages', {'results': content + "<br/>"});

        //Prevent submiting the form
        event.preventDefault();
    });

})