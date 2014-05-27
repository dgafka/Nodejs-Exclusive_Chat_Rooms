/** Events handling in socket.io */
/** on -> getting called when, sockets "emit" an message */
/** emit -> calls "on" on client side */
module.exports = function(sockets) {
    this.sockets = sockets;

    /** Emits first message to connected client */
    this.firstConnect = function(socket) {
        var data = {
            content: 'Connected to chat...',
            nickname: '<span style="color:red">System</span>'
        };

        //Emits a welcome message to client
        socket.emit('messages', { data: data });
    }

    this.sendClientMessage = function(socket, message) {
        var data = {
            content: message.data,
            nickname: socket.handshake.user.email
        };
        //Broadcast message over all connected sockets, expect the one which sent the message
        socket.broadcast.emit("messages", {data: data});
    }

    /** socket as parameter connection to client */
    this.sockets.on('connection', function(socket) {

        this.firstConnect(socket);

        socket.on('messages', function(message) {
            this.sendClientMessage(socket, message);
        }.bind(this))

    }.bind(this))

}