$(document).ready(function() {

    // Create SocketIO instance
    var socket = io.connect('http://localhost:3000');

    //Recive message and appends message to chat
    socket.on('messages', function(data) {
        data = data.data;
        //escape js and html
        $('#chat_box').append(
            '   <li class="message">' +
                '<span class="message-nickname"> ' + data.nickname + '</span>:' +
                '<span class="message-text"> ' + data.content + '</span>' +
                '</li>'
        );
    });

    //Send a message to the server
    $('#message_send').on("click", function(event){
        //Manipulate data
        var content = $(this).parent().parent().children('#message_input').val();
        $(this).parent().parent().parent().parent().children('.panel-body').children('#chat_box').append(
        '   <li class="message">' +
                '<span class="message-nickname"> ' + 'Ja ' + '</span>:' +
                '<span class="message-text">' + content + '</span>' +
            '</li>'
        );
        $(this).parent().parent().children('#message_input').val('');

        //Emits a message to an server.
        socket.emit('messages', {'data': content});

        //Prevent submiting the form
        event.preventDefault();
    });

})