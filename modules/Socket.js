
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
        socket.emit('messages', { data: data});

        this.emitChatRooms(socket);
    }

    this.sendClientMessage = function(socket, message) {
        var data = {
            content: message.data,
            nickname: socket.handshake.user.email
        };
        //Broadcast message over all connected sockets, expect the one which sent the message
        socket.broadcast.emit("messages", {data: data});
//        socket.broadcast.to(chatroom).emit("messages", {data: data});
    }

    /**
     * Sends chat rooms to client
     */
    this.emitChatRooms = function(socket) {
        var chat = require('./ChatController');
        var chatController     = new chat();
        chatController.findAllChats(function(err, results){
            if(err){
                return console.error(err);
            }
            socket.emit('chat_rooms', {data: results})
        });
    }

    this.userDelegateToChat = function(email, chatName, callback){
        var chat = require('./ChatController');
        var chatController     = new chat();

        chatController.addUserToChat(chatName, email, callback);
    }

    this.userUndelegateFromChat = function(email, chatName){
        var chat = require('./ChatController');
        var chatController     = new chat();

        chatController.removeUserFromChat(chatName, email);
    }

    /** socket as parameter connection to client */
    this.sockets.on('connection', function(socket) {

        this.firstConnect(socket);

        socket.on('user_joins_chat', function(chatName){
            this.userDelegateToChat(socket.handshake.user.email, chatName, function(results){
                if(results) {
                    socket.join(chatName);
                    socket.emit('messages', {'data' : 'Joined chat.'})
                    return;
                }
                socket.emit('messages', {'data' : 'Sorry, but you\'re member of other chat already'})
            });
        }.bind(this))

        socket.on('user_leaves_chat', function(chatName){
            socket.leave(chatName);
            this.userUndelegateFromChat(socket.handshake.user.email, chatName);
        }.bind(this))

        socket.on('messages', function(message) {
            this.sendClientMessage(socket, message);
        }.bind(this))

        socket.on('chat_create',function(name) {
            var chat = require('./ChatController');
            var chatController     = new chat();
            chatController.addChat(name, socket.handshake.user.email);
            this.emitChatRooms(socket);
        }.bind(this))

        socket.on('disconnect', function(){
            var email = socket.handshake.user.email;
        })

    }.bind(this))

}