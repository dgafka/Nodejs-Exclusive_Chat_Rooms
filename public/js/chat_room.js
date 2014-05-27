$(document).ready(function() {

    // Create SocketIO instance
    var socket = io.connect('http://localhost:3000');

    //Recive message and appends message to chat
    socket.on('chat_rooms', function(data) {
        data = data.data;
        data.forEach(function(chat, index){
            $('#chat_box').append(
                '<li>'+ chat.name +'</li>'
            )
        })
    });

    $('#chat_room_create').on('click', function(){
        var name = $('#chat_room_name').val();
        if(name.length < 3) {
            alert('Name chat with atleast 3 characters.')
            return;
        }
        socket.emit('chat_create', name);
    })

})